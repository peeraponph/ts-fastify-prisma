import { describe, it, beforeEach, beforeAll, afterAll, expect, vi } from 'vitest'
import { PrismaClient } from '../../src/generated/prisma'
import { processOutboxEvents } from '../../src/application/jobs/outbox.processor'
import { setKafkaProducer } from '../../src/infrastructure/kafka/kafka'
import { resetTestDB } from '../../setup/setupTestDB'
import {
    mockKafkaProducer,
    mockSend,
    resetKafkaProducerMocks,
} from '../__mocks__/mockKafkaProducer'

const prisma = new PrismaClient()

beforeAll(() => {
    setKafkaProducer(mockKafkaProducer as any)
})

beforeEach(async () => {
    await prisma.outbox.deleteMany()
    resetKafkaProducerMocks()
    mockSend
        .mockResolvedValue([])
})


describe('Outbox Processor (Internal Integration)', () => {

    beforeEach(async () => {
        // Clean up all events before each test
        resetTestDB()
    })

    // it('should process only PENDING events and mark them as SENT', async () => {
    //     const now = new Date()
    //     // Create 2 PENDING and 1 already SENT
    //     await prisma.outbox.createMany({
    //         data: [
    //             {
    //                 id: 'event-1',
    //                 topic: 'user.events',
    //                 key: 'key-1',
    //                 eventType: 'user.created',
    //                 payload: { id: 1, name: 'John' },
    //                 status: 'PENDING',
    //                 createdAt: new Date(now.getTime() - 10000),
    //             },
    //             {
    //                 id: 'event-2',
    //                 topic: 'user.events',
    //                 key: 'key-2',
    //                 eventType: 'user.created',
    //                 payload: { id: 2, name: 'Jane' },
    //                 status: 'PENDING',
    //                 createdAt: new Date(now.getTime() - 5000),
    //             },
    //             {
    //                 id: 'event-3',
    //                 topic: 'user.events',
    //                 key: 'key-3',
    //                 eventType: 'user.created',
    //                 payload: { id: 3, name: 'Bob' },
    //                 status: 'SENT',
    //                 createdAt: now,
    //                 sentAt: now,
    //             },
    //         ]
    //     })

    //     await processOutboxEvents()

    //     const all = await prisma.outbox.findMany({ orderBy: { createdAt: 'asc' } })
    //     const sent = all.filter(e => e.status === 'SENT')
    //     const untouched = all.find(e => e.id === 'event-3')

    //     expect(all.length).toBe(3)
    //     expect(sent.length).toBe(2)
    //     expect(mockSend).toHaveBeenCalledTimes(2)
    //     expect(untouched?.status).toBe('SENT') // event-3
    //     expect(untouched?.sentAt).not.toBeNull()
    // })

    it('should not double-process events across concurrent workers', async () => {
        await prisma.outbox.create({
            data: {
                topic: 'user.created',
                key: '123',
                eventType: 'user.created',
                payload: { id: '123' },
                status: 'PENDING',
            },
        })

        await Promise.all([
            processOutboxEvents(),
            processOutboxEvents(),
            processOutboxEvents(),
            processOutboxEvents(),
        ])

        const allEvents = await prisma.outbox.findMany()
        expect(allEvents.filter(e => e.status === 'SENT').length).toBe(1)
    })


    it('should mark event as SENT on success', async () => {
        mockSend.mockReset()
        mockSend
        .mockResolvedValueOnce([]) // for event-1
        .mockResolvedValueOnce([]) // for event-2

        await prisma.outbox.create({
            data: {
                topic: 'user.events',
                key: 'user-1',
                eventType: 'user.created',
                payload: { id: 1 },
                status: 'PENDING',
            },
        })

        await processOutboxEvents()

        const result = await prisma.outbox.findFirst()
        expect(result!.status).toBe('SENT')
    })

    it('should mark event as ERROR on producer failure', async () => {
        mockSend.mockRejectedValueOnce(new Error('Kafka failed'))

        await prisma.outbox.create({
            data: {
                topic: 'user.events',
                key: 'user-1',
                eventType: 'user.created',
                payload: { id: 1 },
                status: 'PENDING',
            },
        })

        await processOutboxEvents()

        const result = await prisma.outbox.findFirst()
        expect(result!.status).toBe('ERROR')
        expect(result!.error).toContain('Kafka failed')
    })


})
