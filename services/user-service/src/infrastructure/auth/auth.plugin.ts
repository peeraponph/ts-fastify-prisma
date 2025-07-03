// services/user-service/src/infrastructure/auth/auth.plugin.ts
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { UserPayload } from '../../shared/types/auth'

// Extend Fastify types
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: any, reply: any) => Promise<void>
        authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>
    }

    interface FastifyRequest {
        user?: UserPayload
    }
}

async function authPlugin(fastify: any, options: any) {
    // Authentication decorator
    fastify.decorate('authenticate', async (request: any, reply: any) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '')

            if (!token) {
                return reply.code(401).send({
                    statusCode: 401,
                    error: 'Unauthorized',
                    message: 'Missing authorization token'
                })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserPayload
            request.user = decoded
        } catch (error) {
            return reply.code(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid token'
            })
        }
    })

    // Authorization decorator
    fastify.decorate('authorize', (roles: string[]) => {
        return async (request: any, reply: any) => {
            if (!request.user) {
                return reply.code(401).send({
                    statusCode: 401,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                })
            }

            if (!roles.includes(request.user.role)) {
                return reply.code(403).send({
                    statusCode: 403,
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                })
            }
        }
    })
}

export default fp(authPlugin)