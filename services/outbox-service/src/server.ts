// services/outbox-service/src/server.ts

import Fastify from 'fastify';
import metricsPlugin from './infrastructure/metrics/metrics.plugin';
import { startOutboxProcessor } from './application/jobs/outbox.processor';
import { connectProducer } from './infrastructure/kafka/kafka';
import { setupOpenTelemetry } from './infrastructure/tracing/otel';

async function startServer() {
    const app = Fastify({ logger: true });

    await setupOpenTelemetry();
    await app.register(metricsPlugin);
    await connectProducer();
    startOutboxProcessor();

    await app.listen({ port: 5002, host: '0.0.0.0' });
    console.log('🚀 outbox-service listening on port 5002');
}

startServer();
