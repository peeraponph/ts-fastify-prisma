// services/user-service/src/presentation/routes/auth.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { loginHandler } from '../handlers/auth.handler'
import { LoginSchema } from '../../types/auth.types'

export default async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.post('/login', {
        schema: {
            description: 'User login to get access token',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 4 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' }
                    }
                }
            }
        }
    }, loginHandler)
}