// src/infrastructure/tracing/request-tracing.plugin.ts
import { FastifyPluginAsync } from 'fastify'
import { context, trace } from '@opentelemetry/api'

export const requestTracingPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', async (request) => {
        const tracer = trace.getTracer('user-service')

        // เริ่ม span ใหม่
        const span = tracer.startSpan(`HTTP ${request.method} ${request.url}`)
        request.otelSpan = span

        // ใช้ context ของ span นั้น
        request.otelContext = trace.setSpan(context.active(), span)
    })

    fastify.addHook('onResponse', async (request) => {
        request.otelSpan?.end()
    })
}
