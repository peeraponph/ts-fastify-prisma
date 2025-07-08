import Fastify from 'fastify'
import metricsPlugin from './infrastructure/metrics/metrics.plugin'
import { startOutboxProcessor } from './application/jobs/outbox.processor'

async function startServer() {
    const fastify = Fastify({
        logger: true,
    })

    // ✅ Metrics endpoint
    await fastify.register(metricsPlugin)

    // ✅ Start processing loop
    await startOutboxProcessor()

    // ✅ Start Fastify server (for Prometheus to scrape)
    await fastify.listen({ port: 5002, host: '0.0.0.0' })
    console.log('🚀 outbox-processor listening on port 5002')
}

startServer()
