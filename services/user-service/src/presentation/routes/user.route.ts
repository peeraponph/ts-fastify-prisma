//  service/user-service/src/presentation/routes/user.route.ts
import { FastifyInstance } from 'fastify'
import { createUserHandler, getUserHandler, getUserListHandler } from '../handlers/user.handler'
// import { z } from 'zod'

// const CreateUserSchema = z.object({
//     name: z.string(),
//     email: z.string().email(),
//     password: z.string().min(6),
//     role: z.enum(['USER', 'ADMIN']),
//     group: z.string()
// })

const CreateUserSchemaJson = {
    type: 'object',
    required: ['name', 'email', 'password', 'role', 'group'],
    properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        role: { type: 'string', enum: ['USER', 'ADMIN'] },
        group: { type: 'string' }
    }
}

export default async function userRoutes(server: FastifyInstance) {
    server.get('/', {
        schema: {
            tags: ['User'],
            summary: 'List all users',
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                            group: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    }, getUserListHandler)

    server.get('/:id', {
        schema: {
            tags: ['User'],
            summary: 'Get user by ID',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        group: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }, getUserHandler)

    server.post('/', {
        schema: {
            tags: ['User'],
            summary: 'Create new user',
            body: CreateUserSchemaJson,
            response: {
                201: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        group: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }, createUserHandler)
}
