import { FastifyRequest, FastifyReply } from 'fastify'

export function authorizeRoles(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user as { role?: string }

        if (!user || !user.role || !allowedRoles.includes(user.role)) {
            return reply.code(403).send({ error: 'Forbidden: insufficient permissions' })
        }
    }
}


