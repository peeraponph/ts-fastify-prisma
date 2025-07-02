// service/user-service/src/presentation/handlers/user.handler.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../../application/services/user.service'
import { userRepository } from '../../infrastructure/repositories/user.repository.prisma'
import { UserLogProducerService } from '../../application/events/log.producer'

const logProducer = new UserLogProducerService()
const service = new UserService(userRepository, logProducer)

export const getUserListHandler = async (_req: FastifyRequest, reply: FastifyReply) => {
    const users = await service.listUsers()
    return reply.send(users)
}

export const getUserHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const id = Number(req.params)
    const user = await service.getUser(id)
    return reply.send(user)
}

export const createUserHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any
    const user = await service.createUser(body)
    return reply.code(201).send(user)
}

// export const updateUserHandler = async (req: FastifyRequest, reply: FastifyReply) => {
//     const id = Number(req.params.id)
//     const body = req.body as any
//     const updatedUser = await service.updateUser(id, body)
//     return reply.send(updatedUser)
// }