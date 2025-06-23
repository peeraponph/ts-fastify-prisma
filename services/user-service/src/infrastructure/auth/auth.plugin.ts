import fp from 'fastify-plugin'
import { verifyToken } from './jwt'

export default fp(async (fastify) => {
    fastify.decorate('authenticate', async (req, reply) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '')
            if (!token) throw new Error('Missing token')

            const user = verifyToken(token)
            req.user = user // ต้อง declare type เพิ่ม
        } catch (err) {
            reply.status(401).send({ error: 'Unauthorized' })
        }
    })
})
