// services/notification-service/src/server.ts

import Fastify from 'fastify'
import metricsPlugin from './src/infrastructure/metrics/metrics.plugin'
import { startKafkaConsumers } from './src/infrastructure/kafka/consumer'

async function start() {
    const fastify = Fastify({
        logger: true, // close if yu don't want logs
    })

    //endpoint /metrics
    await fastify.register(metricsPlugin)

    // start Kafka consumer
    await startKafkaConsumers()


    await fastify.listen({ port: 5001, host: '0.0.0.0' }) 
    console.log('✅ notification-service is listening on :5001 for metrics')
}

start()
