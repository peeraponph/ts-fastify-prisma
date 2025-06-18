// src/plugins/healthcheck.ts
import { FastifyPluginAsync } from 'fastify'

const healthcheckPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/healthz', async () => {
        return { status: 'ok' }
    })
}

export default healthcheckPlugin
