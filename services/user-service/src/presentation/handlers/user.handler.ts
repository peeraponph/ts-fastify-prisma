// services/user-service/src/presentation/handlers/user.handler.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../../application/services/user.service'
import { userRepository } from '../../infrastructure/repositories/user.repository.prisma'
import { UserLogProducerService } from '../../application/events/log.producer'
import {
    CreateUserSchema,
    UpdateUserSchema,
    GetUserParamsSchema,
    ListUsersQuerySchema,
    CreateUserInput,
    UpdateUserInput,
    GetUserParams,
    ListUsersQuery
} from '../../types/user.types'
import { UserPayload } from '../../shared/types/auth'

// Define extended request types
interface AuthenticatedRequest extends FastifyRequest {
    user?: UserPayload
}

interface TypedRequest<T = unknown> extends AuthenticatedRequest {
    body: T
}

interface TypedRequestWithParams<T = unknown, P = unknown> extends AuthenticatedRequest {
    body: T
    params: P
}

const logProducer = new UserLogProducerService()
const userService = new UserService(userRepository, logProducer)

// Error handler wrapper
const asyncHandler = (fn: Function) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            return await fn(request, reply)
        } catch (error) {
            request.log.error(error)

            if (error instanceof Error) {
                const statusCode = error.message.includes('not found') ? 404 :
                    error.message.includes('already exists') ? 409 : 400
                return reply.code(statusCode).send({
                    statusCode,
                    error: error.name,
                    message: error.message
                })
            }

            return reply.code(500).send({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
            })
        }
    }
}

export const getUserListHandler = asyncHandler(async (
    request: FastifyRequest<{ Querystring: ListUsersQuery }>,
    reply: FastifyReply
) => {
    const query = ListUsersQuerySchema.parse(request.query)

    const result = await userService.listUsers(query)

    return reply.send(result)
})

export const getUserHandler = asyncHandler(async (
    request: TypedRequestWithParams<unknown, GetUserParams>,
    reply: FastifyReply
) => {
    const { id } = GetUserParamsSchema.parse(request.params)

    const user = await userService.getUser(id)

    if (!user) {
        return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'User not found'
        })
    }

    // Remove password from response
    const { password, ...userResponse } = user

    return reply.send(userResponse)
})

export const createUserHandler = asyncHandler(async (
    request: TypedRequest<CreateUserInput>,
    reply: FastifyReply
) => {
    const validatedData = CreateUserSchema.parse(request.body)

    const user = await userService.createUser(validatedData)

    // Remove password from response
    const { password, ...userResponse } = user

    return reply.code(201).send(userResponse)
})

export const updateUserHandler = asyncHandler(async (
    request: TypedRequestWithParams<UpdateUserInput, GetUserParams>,
    reply: FastifyReply
) => {
    const { id } = GetUserParamsSchema.parse(request.params)
    const validatedData = UpdateUserSchema.parse(request.body)

    const user = await userService.updateUser(id, validatedData)

    // Remove password from response
    const { password, ...userResponse } = user

    return reply.send(userResponse)
})

export const deleteUserHandler = asyncHandler(async (
    request: TypedRequestWithParams<unknown, GetUserParams>,
    reply: FastifyReply
) => {
    const { id } = GetUserParamsSchema.parse(request.params)

    await userService.deleteUser(id)

    return reply.code(204).send()
})