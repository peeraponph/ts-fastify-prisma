// services/user-service/src/infrastructure/tracing/otel.ts

import { FastifyOtelInstrumentation } from '@fastify/otel'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs'
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis'

const otelInstrumentation = new FastifyOtelInstrumentation({
    servername: process.env.OTEL_SERVICE_NAME || 'user-service',
    registerOnInitialization: false,
    requestHook: (span, req) => {
        span.setAttribute('custom.userAgent', req.headers['user-agent'] || '')
    },
})

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [
        otelInstrumentation,
        new KafkaJsInstrumentation(),
        new RedisInstrumentation(),
    ],
})

export async function setupOpenTelemetry() {
    await sdk.start()
    console.log('✅ OpenTelemetry SDK started')
}

export function otelPlugin() {
    return otelInstrumentation.plugin()
}
