import { FastifyPluginAsync } from 'fastify'
import { createUser, getAllUsers } from '../services/user.service'

const userRoutes: FastifyPluginAsync = async (fastify) => {
    
    fastify.post('/', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string }
        const user = await createUser(name, email)
        return user
    })

    fastify.get('/', async () => {
        return await getAllUsers()
    })
}

export default userRoutes
