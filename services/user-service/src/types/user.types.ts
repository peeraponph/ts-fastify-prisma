// services/user-service/src/types/user.types.ts
import { z } from 'zod'

// Base user schema
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().min(1),
    group: z.string().min(1),
    role: z.enum(['USER', 'ADMIN']),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
})

// Create user schema
export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
    name: z.string().min(1),
    group: z.string().min(1),
    role: z.enum(['USER', 'ADMIN']).default('USER')
})

// Update user schema
export const UpdateUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    group: z.string().min(1).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional()
})

// Query schemas
export const GetUserParamsSchema = z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
})

export const ListUsersQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    role: z.enum(['USER', 'ADMIN']).optional()
})

// Type exports
export type User = z.infer<typeof UserSchema>
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type GetUserParams = z.infer<typeof GetUserParamsSchema>
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>

// JSON Schema for Fastify
export const CreateUserSchemaJson = {
    type: 'object',
    required: ['email', 'password', 'name', 'group'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 4 },
        name: { type: 'string', minLength: 1 },
        group: { type: 'string', minLength: 1 },
        role: { type: 'string', enum: ['USER', 'ADMIN'], default: 'USER' }
    }
}

export const UpdateUserSchemaJson = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 1 },
        group: { type: 'string', minLength: 1 },
        role: { type: 'string', enum: ['USER', 'ADMIN'] },
        isActive: { type: 'boolean' }
    }
}

export const UserResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        group: { type: 'string' },
        role: { type: 'string', enum: ['USER', 'ADMIN'] },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
}