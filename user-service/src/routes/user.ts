// src/routes/user.ts
import { FastifyPluginAsync } from 'fastify'

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string }
        // จะส่ง event ไป Kafka ใน EP3
        return { id: Date.now(), name, email }
    })
}

export default userRoutes
