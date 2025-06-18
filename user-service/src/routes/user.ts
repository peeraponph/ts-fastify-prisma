// src/routes/user.ts
import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string }

        const user = await prisma.user.create({
            data: { name, email }
        })

        return user
    })

    fastify.get('/', async () => {
        const users = await prisma.user.findMany()
        return users
    })
}

export default userRoutes
