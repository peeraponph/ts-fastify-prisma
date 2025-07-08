//  service/notification-service/src/infrastructure/metrics/metrics.plugin.ts

import { FastifyPluginAsync } from 'fastify'
import { register } from './index'

const metricsPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/metrics', async (_request, reply) => {
        reply.header('Content-Type', register.contentType)
        return register.metrics()
    })
}

export default metricsPlugin
