import { PrismaClient } from '../../generated/prisma'
import { producer } from '../../infrastructure/kafka/kafka'
import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api'
import {
    outboxKafkaSuccessCounter,
    outboxKafkaErrorCounter,
    outboxKafkaProduceDuration,
} from '../../infrastructure/metrics/outbox.metrics'

const prisma = new PrismaClient()
const tracer = trace.getTracer('outbox-service')

export async function processOutboxEvents() {
    const span = tracer.startSpan('outbox.process.batch')

    try {
        const events = await prisma.outbox.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: 10,
        })

        for (const event of events) {
            await context.with(trace.setSpan(context.active(), span), async () => {
                const eventSpan = tracer.startSpan(`outbox.process.${event.eventType}`)

                const start = process.hrtime()

                try {
                    await producer.send({
                        topic: event.topic,
                        messages: [
                            {
                                key: event.key,
                                value: JSON.stringify(event.payload),
                            },
                        ],
                    })

                    const [sec, nano] = process.hrtime(start)
                    const duration = sec + nano / 1e9
                    outboxKafkaProduceDuration.labels(event.eventType).observe(duration)
                    outboxKafkaSuccessCounter.labels(event.eventType).inc()

                    await prisma.outbox.update({
                        where: { id: event.id },
                        data: { status: 'SENT', sentAt: new Date() },
                    })

                    eventSpan.setStatus({ code: SpanStatusCode.OK })
                } catch (err) {
                    outboxKafkaErrorCounter.labels(event.eventType).inc()
                    eventSpan.recordException(err as any)
                    eventSpan.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: String(err),
                    })

                    await prisma.outbox.update({
                        where: { id: event.id },
                        data: { status: 'ERROR', error: String(err) },
                    })
                } finally {
                    eventSpan.end()
                }
            })
        }
    } catch (err) {
        span.recordException(err as any)
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: String(err),
        })
    } finally {
        span.end()
    }
}

export async function startOutboxProcessor() {
    setInterval(() => {
        processOutboxEvents().catch((err) =>
            console.error('❌ Error in outbox processor loop:', err),
        )
    }, 5000)
}
