// services/user-service/tests/integration/user.integration.test.ts

import { describe, it, beforeEach, beforeAll, afterAll, expect } from 'vitest'
import request from 'supertest'
import { setupTestServer } from '../../setup/setupTestServer'
import { resetTestDB } from '../../setup/setupTestDB'
import { PrismaClient } from '../../src/generated/prisma'
import { PrismaClient as OutboxPrismaClient } from '../../src/generated/outbox-prisma'

const userPrisma = new PrismaClient()
const outboxPrisma = new OutboxPrismaClient()

// Integration tests for user creation and outbox event writing
describe('POST /users (Integration)', () => {
    let app: Awaited<ReturnType<typeof setupTestServer>>

    beforeAll(async () => {
        app = await setupTestServer()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        await resetTestDB()
    })

    describe('create user write to outbox', () => {
        // create user test -> write to outbox 
        it('should create user and write to outbox', async () => {
            const testId = Math.round(Math.random() * 1e5)
            console.log(`Running test with ID: ${testId}`)
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

            const user = await userPrisma.user.findUnique({ where: { email: payload.email } })
            expect(user).not.toBeNull()

            const outbox = await outboxPrisma.outbox.findFirst({
                where: {
                    key: user!.id.toString()
                }
            })
            expect(outbox).not.toBeNull()
            expect(outbox!.eventType).toBe('user.created')
            expect(outbox!.headers).toHaveProperty('traceparent')
        })
    })

    // validation errors
    describe('validation errors', () => {

        // test field missing, email invalid, password too short
        it('should return 400 if required fields are missing', async () => {
            const res = await request(app.server)
                .post('/api/v1/users')  
                .send({
                    name: 'Test fields are missing',
                    email: 'nVc3o@example.com',
                    password: 'password123',
                    // group: 'users',       // missing
                    role: 'USER'
                })

            expect(res.status).toBe(400)
            expect(res.body).toHaveProperty('error')
        })

        it('should return 400 if email is invalid', async () => {
            const res = await request(app.server)
                .post('/api/v1/users')
                .send({
                    name: 'Invalid Email User',
                    email: 'invalid-email',
                    password: 'password123',
                    group: 'users',
                    role: 'USER'
                })

            expect(res.status).toBe(400)
            expect(res.body).toHaveProperty('error')
        })

        it('should return 400 if password is too short', async () => {
            const res = await request(app.server)
                .post('/api/v1/users')
                .send({
                    name: 'Short Password User',
                    email: 'nVc3o@example.com',
                    password: 'pw', // too short
                    group: 'users',
                    role: 'USER'
                })

            expect(res.status).toBe(400)
            expect(res.body).toHaveProperty('error')
        })
    })

    describe('user conflict error', () => {


        it('should return 409 if user already exists', async () => {
            const testId = Math.round(Math.random() * 1e5)
            console.log(`Running test with ID: ${testId}`)
            const payload = {
                name: `user-test-id-${testId}`,
                email: `user-test-id-${testId}@example.com`,
                password: `password-${testId}`,
                group: 'users',
                role: 'USER'
            }

            await request(app.server)
                .post('/api/v1/users')
                .send(payload)

            const res = await request(app.server)
                .post('/api/v1/users')
                .send(payload)

            expect(res.status).toBe(409)
            expect(res.body).toHaveProperty('error')
        })
    })

})

