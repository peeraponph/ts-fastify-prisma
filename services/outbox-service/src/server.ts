import Fastify from 'fastify'
import metricsPlugin from './infrastructure/metrics/metrics.plugin'
import { startOutboxProcessor } from './application/jobs/outbox.processor'
import { connectProducer } from './infrastructure/kafka/kafka'

async function startServer() {
    const fastify = Fastify({
        logger: true,
    })

    // ✅ Metrics endpoint
    await fastify.register(metricsPlugin)

    // ✅ Connect Kafka producer before starting loop
    await connectProducer()

    // ✅ Start processing loop
    await startOutboxProcessor()

    // ✅ Start Fastify server (for Prometheus to scrape)
    await fastify.listen({ port: 5002, host: '0.0.0.0' })
    console.log('🚀 outbox-processor listening on port 5002')
}

startServer()
