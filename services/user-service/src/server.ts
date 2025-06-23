import Fastify from 'fastify'
import userRoutes from './routes/user.route'
import { producer } from './kafka'
import logger from './plugins/logger'

import healthRoute from './routes/health.route'

const server = Fastify({ logger: true }) // Initialize Fastify server instance (use logger plugin instaead)

// Register plugins
server.register(logger)

// Register routes
server.register(userRoutes, { prefix: '/users' })
server.register(healthRoute)

const start = async () => {
    try {
        await producer.connect()
        await server.listen({ port: 3000, host: '0.0.0.0' })
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
