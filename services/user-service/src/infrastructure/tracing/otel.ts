// services/user-service/src/infrastructure/tracing/otel.ts

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs'
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis'

export async function setupOpenTelemetry() {
    const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:14318/v1/traces',
        }),
        instrumentations: [
            new KafkaJsInstrumentation(),
            new RedisInstrumentation(),
        ],
    })

    await sdk.start()
    console.log('✅ OpenTelemetry SDK started')
}
