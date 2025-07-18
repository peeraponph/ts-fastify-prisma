import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '../../src/generated/prisma'
import { processOutboxEvents } from '../../src/application/jobs/outbox.processor'

const prisma = new PrismaClient()

describe('Outbox Processor → Kafka', () => {
    beforeAll(async () => {
        await prisma.$connect()
        await prisma.outbox.create({
            data: {
                topic: 'user.created',
                key: '999',
                eventType: 'user.created',
                payload: { id: 999, name: 'Fake' },
                headers: {},
            },
        })
    })

    afterAll(() => prisma.$disconnect())

    it('should process PENDING outbox event', async () => {
        await processOutboxEvents()

        const event = await prisma.outbox.findFirst({
            where: { key: '999', eventType: 'user.created' },
        })
        expect(event?.status).toBe('SENT')
        expect(event?.sentAt).toBeInstanceOf(Date)
    })
})
