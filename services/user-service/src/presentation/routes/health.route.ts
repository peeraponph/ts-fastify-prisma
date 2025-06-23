// src/plugins/healthcheck.ts
import { FastifyPluginAsync } from 'fastify'

const healthcheckPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/health', async () => {
        return { status: 'ok' }
    })

    fastify.get('/readiness', async () => {
        // TODO: check database, Kafka
        return { status: 'ready' }
    })

    fastify.get('/liveness', async () => {
        return { status: 'alive' }
      })
}

export default healthcheckPlugin
