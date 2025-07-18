import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { setupTestDB } from '../utils/setupTestDB'
import { setupServerForTest } from '../utils/setupServerForTest'
import { connectProducer } from '../../src/infrastructure/kafka/kafka'
import { prisma } from '../../src/infrastructure/prisma/prisma'

let app: Awaited<ReturnType<typeof setupServerForTest>>

describe('User Integration - Create User → Outbox', () => {
    beforeAll(async () => {
        app = await setupServerForTest()
        await connectProducer()
        await setupTestDB()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should create user and write outbox event', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/users',
            payload: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'test123',
                group: 'test-group',
            },
        })

        expect(res.statusCode).toBe(201)

        const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } })
        const outbox = await prisma.outbox.findFirst({ where: { key: String(user?.id) } })

        expect(user).toBeDefined()
        expect(outbox).toBeDefined()
    })
})
