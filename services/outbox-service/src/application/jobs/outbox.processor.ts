// services/outbox-service/src/application/jobs/outbox.processor.ts
import { PrismaClient } from '../../generated/prisma'
import { getKafkaProducer } from '../../infrastructure/kafka/kafka'
import { trace, context, SpanStatusCode, propagation } from '@opentelemetry/api'
import {
    outboxKafkaSuccessCounter,
    outboxKafkaErrorCounter,
    outboxKafkaProduceDuration,
} from '../../infrastructure/metrics/outbox.metrics'

const prisma = new PrismaClient()
const tracer = trace.getTracer('outbox-service')

export async function processOutboxEvents() {
    try {
        const producer = getKafkaProducer()
        console.log('📦 Using producer:', producer)
        
        await prisma.$transaction(async (tx) => {
            const events = await tx.$queryRawUnsafe<any[]>(`
              UPDATE "Outbox"
              SET status = 'PROCESSING'
              WHERE id IN (
                SELECT id FROM "Outbox"
                WHERE status = 'PENDING'
                ORDER BY "createdAt"
                FOR UPDATE SKIP LOCKED
                LIMIT 10
              )
              RETURNING *
            `)

            for (const event of events) {
                const parentContext = propagation.extract(context.active(), event.headers ?? {})
                const span = tracer.startSpan(`outbox.process.${event.eventType}`, undefined, parentContext)

                await context.with(trace.setSpan(context.active(), span), async () => {
                    const kafkaHeaders: Record<string, string> = {}
                    propagation.inject(context.active(), kafkaHeaders)

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

                        await tx.outbox.update({
                            where: { id: event.id },
                            data: { status: 'SENT', sentAt: new Date() },
                        })
                        span.setStatus({ code: SpanStatusCode.OK })
                        
                    } catch (err) {
                        outboxKafkaErrorCounter.labels(event.eventType).inc()
                        span.recordException(err as any)
                        span.setStatus({
                            code: SpanStatusCode.ERROR,
                            message: String(err),
                        })

                        await tx.outbox.update({
                            where: { id: event.id },
                            data: { status: 'ERROR', error: String(err) },
                        })
                    } finally {
                        span.end()
                    }
                })
            }

            if (events.length > 0) {
                console.log(`✅ Processed ${events.length} outbox events`)
            } else {
                console.log('🔄 No pending outbox events to process')
            }
        })
    } catch (err) {
        console.error('❌ Error processing outbox events:', err)
    }
}

export function startOutboxProcessor() {
    setInterval(() => {
        processOutboxEvents().catch((err) =>
            console.error('❌ Error in outbox processor loop:', err),
        )
    }, 10_000)
}
