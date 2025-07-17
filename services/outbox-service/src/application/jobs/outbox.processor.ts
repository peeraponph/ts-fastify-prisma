// services/outbox-service/src/application/jobs/outbox.processor.ts
import { PrismaClient } from '../../generated/prisma'
import { producer } from '../../infrastructure/kafka/kafka'
import { trace, context, SpanStatusCode, Span, propagation } from '@opentelemetry/api'
import {
    outboxKafkaSuccessCounter,
    outboxKafkaErrorCounter,
    outboxKafkaProduceDuration,
} from '../../infrastructure/metrics/outbox.metrics'

const prisma = new PrismaClient()
const tracer = trace.getTracer('outbox-service')

export async function processOutboxEvents() {
    const span = tracer.startSpan('outbox.process.batch')
    const kafkaHeaders: Record<string, string> = {}
    propagation.inject(context.active(), kafkaHeaders)

    try {
        const events = await prisma.outbox.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: 10,
        })

        for (const event of events) {
            await context.with(trace.setSpan(context.active(), span), async () => {

                const parentContext = propagation.extract(context.active(), event.headers ?? {})
                const eventSpan = tracer.startSpan(`outbox.process.${ event.eventType }`, undefined, parentContext)

                await context.with(trace.setSpan(context.active(), eventSpan), async () => {
                    const kafkaHeaders: Record<string, string> = {}
                    propagation.inject(context.active(), kafkaHeaders) // inject context into Kafka headers

                    const start = process.hrtime()
                    try {
                        await producer.send({
                            topic: event.topic,
                            messages: [
                                {
                                    key: event.key,
                                    value: JSON.stringify(event.payload),
                                    headers: kafkaHeaders
                                },
                            ],
                        })
                        console.log('[Kafka Headers]', kafkaHeaders)
                        const [sec, nano] = process.hrtime(start)
                        const duration = sec + nano / 1e9
                        outboxKafkaProduceDuration.labels(event.eventType).observe(duration)
                        outboxKafkaSuccessCounter.labels(event.eventType).inc()

                        await prisma.outbox.update({
                            where: { id: event.id },
                            data: { status: 'SENT', 
                            sentAt: new Date() },
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

            })
        }
        if (events.length > 0) {
            console.log(`✅ Processed ${ events.length } outbox events`)
        } else {
            console.log('🔄 No pending outbox events to process')
        }
    } catch (err) {
        span.recordException(err as any)
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: String(err),
        })
        console.error('❌ Error processing outbox events:', err)
    } finally {
        span.end()
    }
}

function sanitizeKafkaHeaders(headers: Record<string, any>): Record<string, string> {
    const sanitized: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'object') {
            sanitized[key] = JSON.stringify(value)
        } else {
            sanitized[key] = String(value)
        }
    }
    return sanitized
}

export async function startOutboxProcessor() {
    setInterval(() => {
        processOutboxEvents().catch((err) =>
            console.error('❌ Error in outbox processor loop:', err),
        )
    }, 10_000)
}