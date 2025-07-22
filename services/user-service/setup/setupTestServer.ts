// setup/setupTestServer.ts
import { buildApp } from '../src/server' // ฟังก์ชัน build Fastify
import { FastifyInstance } from 'fastify'

export async function setupTestServer(): Promise<FastifyInstance> {
    const app = await buildApp()
    await app.ready()
    return app
}
