// service/user-service/src/infrastructure/metrics/kafka.metrics.ts

import { FastifyPluginAsync } from 'fastify'
import { register } from './index'

const metricsPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/metrics', async (_request, reply) => {
        reply.header('Content-Type', register.contentType)
        return register.metrics()
    })

    fastify.addHook('onRequest', async (request) => {
        (request as any).startTime = process.hrtime()
    })

    fastify.addHook('onResponse', async (request, reply) => {
        const { httpRequestCounter, httpRequestDuration, httpErrorCounter } = await import('./http.metrics')

        const startTime = (request as any).startTime
        const diff = process.hrtime(startTime)
        const durationInSec = diff[0] + diff[1] / 1e9

        const route = request.routeOptions?.url || request.url

        const labels = {
            method: request.method,
            route,
            status_code: reply.statusCode.toString(),
        }

        httpRequestCounter.inc(labels)
        httpRequestDuration.observe(labels, durationInSec)

        if (reply.statusCode >= 400) {
            httpErrorCounter.inc(labels)
        }
    })
}

export default metricsPlugin
