// services/user-service/src/presentation/routes/health.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

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
        return reply.send({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        })
    })
}