// services/user-service/src/infrastructure/auth/auth.plugin.ts
import { FastifyInstance } from 'fastify'

export default async function authPlugin(fastify: FastifyInstance) {
    fastify.addHook('preHandler', async (request, reply) => {
        // Authentication logic
        console.log('Auth middleware executed')
    })
}