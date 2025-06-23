import { FastifyInstance } from 'fastify'
import { createUserHandler, getUserListHandler } from '../handlers/user.handler'
import { authorizeRoles } from '../../infrastructure/auth/rbac.middleware'

export default async function userRoutes(server: FastifyInstance) {
    server.get('/',
        { preHandler: [server.authenticate, authorizeRoles(['admin'])] }, getUserListHandler
    )
    server.post('/',
        { preHandler: [server.authenticate, authorizeRoles(['admin', 'editor'])] },createUserHandler
    )
}
