// services/user-service/src/application/services/outbox.service.ts

import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

export async function writeOutboxEvent(params: {
    topic: string
    key: string
    eventType: string
    payload: any
}) {
    await prisma.outbox.create({
        data: {
            topic: params.topic,
            key: params.key,
            eventType: params.eventType,
            payload: params.payload,
            status: 'PENDING',
        },
    })
}
