// user-service/src/application/services/outbox.service.ts

import { PrismaClient } from '../../generated/outbox-prisma'
import { trace, context } from '@opentelemetry/api'

const outboxPrisma = new PrismaClient()
const tracer = trace.getTracer('user-service')

export async function writeOutboxEvent(params: {
    topic: string
    key: string
    eventType: string
    payload: any
    headers?: Record<string, string>
}) {
    const span = tracer.startSpan('outbox.write')

    return await context.with(trace.setSpan(context.active(), span), async () => {
        try {
            await outboxPrisma.outbox.create({
                data: {
                    topic: params.topic,
                    key: params.key,
                    eventType: params.eventType,
                    payload: params.payload,
                    headers: params.headers ?? {},
                }
            })
            span.setAttribute('outbox.topic', params.topic)
            span.setAttribute('outbox.eventType', params.eventType)
            span.setStatus({ code: 1 }) // OK
        } catch (err) {
            span.recordException(err as any)
            span.setStatus({ code: 2, message: String(err) }) // ERROR
            throw err
        } finally {
            span.end()
        }
    })
}
