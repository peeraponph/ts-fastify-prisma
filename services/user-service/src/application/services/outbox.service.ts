// user-service/src/application/services/outbox.service.ts
import { PrismaClient } from '../../generated/prisma'
import { trace, context, propagation } from '@opentelemetry/api'

const prisma = new PrismaClient()
const tracer = trace.getTracer('user-service')

export async function writeOutboxEvent(params: {
    topic: string
    key: string
    eventType: string
    payload: any
    headers?: Record<string, string>
}) {
    await prisma.outbox.create({
        data: {
            topic: params.topic,
            key: params.key,
            eventType: params.eventType,
            payload: params.payload,
            headers: params.headers ?? {},
        }
    })
}

