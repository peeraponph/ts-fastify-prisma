// src/types/fastify.d.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { UserPayload } from '../shared/types/auth'

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }

    interface FastifyRequest {
        user?: UserPayload
    }
}
