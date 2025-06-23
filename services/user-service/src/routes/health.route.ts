import { FastifyInstance } from 'fastify'

export default async function healthRoute(fastify: FastifyInstance) {
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
