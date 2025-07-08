// services/user-service/src/presentation/routes/health.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { trace, context } from '@opentelemetry/api'

export default async function healthRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/health', {
        schema: {
            description: 'Health check endpoint',
            tags: ['Health'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                        uptime: { type: 'number' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const tracer = trace.getTracer('user-service')

        // ⚠️ ต้องรัน span นี้ใน context ที่ถูกต้อง
        await context.with(request.otelContext!, async () => {
            const span = tracer.startSpan('custom-health-span')
            span.addEvent('Health check triggered')
            span.end()
        })

        return reply.send({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        })
    })
}
