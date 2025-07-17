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
    try {
        const events = await prisma.outbox.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: 10,
        })

        for (const event of events) {
            // 🧠 1. Extract parent context จาก user-service ที่ inject มากับ headers
            const parentContext = propagation.extract(context.active(), event.headers ?? {})

            // ✅ 2. Start span โดยใช้ parentContext ที่ extract ได้
            const eventSpan = tracer.startSpan(`outbox.process.${event.eventType}`, undefined, parentContext)

            await context.with(trace.setSpan(context.active(), eventSpan), async () => {
                const kafkaHeaders: Record<string, string> = {}
                propagation.inject(context.active(), kafkaHeaders) // inject context ก่อนส่ง Kafka ต่อ

                const start = process.hrtime()

                try {
                    await producer.send({
                        topic: event.topic,
                        messages: [
                            {
                                key: event.key,
                                value: JSON.stringify(event.payload),
                                headers: kafkaHeaders,
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

        if (events.length > 0) {
            console.log(`✅ Processed ${events.length} outbox events`)
        } else {
            console.log('🔄 No pending outbox events to process')
        }
    } catch (err) {
        console.error('❌ Error processing outbox events:', err)
    }
}

export async function startOutboxProcessor() {
    setInterval(() => {
        processOutboxEvents().catch((err) =>
            console.error('❌ Error in outbox processor loop:', err),
        )
    }, 10_000)
}