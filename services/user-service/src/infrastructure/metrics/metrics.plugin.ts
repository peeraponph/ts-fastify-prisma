// src/infrastructure/metrics/metrics.plugin.ts
import { FastifyPluginAsync } from 'fastify'
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client'

const register = new Registry()

// Collect default metrics: memory usage, CPU, event loop lag ฯลฯ
collectDefaultMetrics({ register })

// Custom metrics
export const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
})

export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

const metricsPlugin: FastifyPluginAsync = async (fastify) => {
    // Register /metrics endpoint
    fastify.get('/metrics', async (_request, reply) => {
        reply.header('Content-Type', register.contentType)
        return register.metrics()
    })

    // Record start time
    fastify.addHook('onRequest', async (request) => {
        // attach startTime to the request
        (request as any).startTime = process.hrtime()
    })

    // Hook to collect metrics after response
    fastify.addHook('onResponse', async (request, reply) => {
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
    })
}

export default metricsPlugin
