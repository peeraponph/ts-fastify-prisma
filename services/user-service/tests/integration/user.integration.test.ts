// services/user-service/tests/integration/user.integration.test.ts

import { describe, it, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { setupTestServer } from '../../setup/setupTestServer'
import { resetTestDB } from '../../setup/setupTestDB'
import { PrismaClient } from '../../src/generated/prisma'
import { group } from 'console'

const prisma = new PrismaClient()

describe('POST /users (Integration)', () => {
    let app: Awaited<ReturnType<typeof setupTestServer>>

    beforeEach(async () => {
        await resetTestDB()
        app = await setupTestServer()
    })

    it('should create user and write to outbox', async () => {
        const testId = Math.round(Math.random() * 1e5)
        const payload = {
            name: `user-test-id-${testId}`,
            email: `user-test-id-${testId}@example.com`,
            password: `password-${testId}`,
            group: 'users',
            role: 'USER'
        }

        const res = await request(app.server)
            .post('/api/v1/users')
            .send(payload)

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('id')

        const user = await prisma.user.findUnique({ where: { email: payload.email } })
        expect(user).not.toBeNull()

        const outbox = await prisma.outbox.findFirst({
            where: {
                key: user!.id.toString()
            }
        })
        expect(outbox).not.toBeNull()
        expect(outbox!.eventType).toBe('user.created')
    })
})
