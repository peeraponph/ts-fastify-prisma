// services/user-service/tests/integration/user.integration.test.ts

import { describe, it, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { setupTestServer } from '../../setup/setupTestServer'
import { resetTestDB } from '../../setup/setupTestDB'
import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()

describe('POST /users (Integration)', () => {
    let app: Awaited<ReturnType<typeof setupTestServer>>

    beforeEach(async () => {
        await resetTestDB()
        app = await setupTestServer()
    })

    it('should create user and write to outbox', async () => {
        const payload = { name: 'Alice', email: 'alice@example.com' }

        const res = await request(app.server)
            .post('/users')
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
        expect(outbox!.eventType).toBe('USER_CREATED')
    })
})
