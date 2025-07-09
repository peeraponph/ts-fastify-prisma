// services/user-service/src/presentation/routes/user.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import {
    getUserListHandler,
    getUserHandler,
    createUserHandler,
    updateUserHandler,
    deleteUserHandler
} from '../handlers/user.handler'
import {
    CreateUserSchemaJson,
    UpdateUserSchemaJson,
    UserResponseSchema
} from '../../types/user.types'

export default async function userRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // GET /users - List all users with pagination
    fastify.get('/', {
        schema: {
            description: 'Get list of users with pagination',
            tags: ['User'],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', minimum: 1, default: 1 },
                    limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
                    search: { type: 'string' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'] }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: UserResponseSchema
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number' },
                                limit: { type: 'number' },
                                total: { type: 'number' },
                                pages: { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
        preHandler: [fastify.authenticate]
    }, getUserListHandler)

    // GET /users/:id - Get user by ID
    fastify.get('/:id', {
        schema: {
            description: 'Get user by ID',
            tags: ['User'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', pattern: '^[0-9]+$' }
                }
            },
            response: {
                200: UserResponseSchema
            }
        },
        preHandler: [fastify.authenticate]
    }, getUserHandler)

    // POST /users - Create new user
    fastify.post('/', {
        schema: {
            description: 'Create a new user',
            tags: ['User'],
            body: CreateUserSchemaJson,
            response: {
                201: UserResponseSchema
            }
        },
        // preHandler: [fastify.authenticate, fastify.authorize(['ADMIN'])]
    }, createUserHandler)

    // PUT /users/:id - Update user
    fastify.put('/:id', {
        schema: {
            description: 'Update user by ID',
            tags: ['User'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', pattern: '^[0-9]+$' }
                }
            },
            body: UpdateUserSchemaJson,
            response: {
                200: UserResponseSchema
            }
        },
        preHandler: [fastify.authenticate, fastify.authorize(['ADMIN'])]
    }, updateUserHandler)

    // DELETE /users/:id - Delete user
    fastify.delete('/:id', {
        schema: {
            description: 'Delete user by ID',
            tags: ['User'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', pattern: '^[0-9]+$' }
                }
            },
            response: {
                204: {
                    type: 'null',
                    description: 'User deleted successfully'
                }
            }
        },
        preHandler: [fastify.authenticate, fastify.authorize(['ADMIN'])]
    }, deleteUserHandler)
}