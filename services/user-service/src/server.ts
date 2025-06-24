import Fastify from 'fastify'
import userRoutes from './presentation/routes/user.route'
import { producer } from './infrastructure/kafka/kafka'
import logger from './presentation/plugins/logger'
import healthRoute from './presentation/routes/health.route'
import authPlugin from './infrastructure/auth/auth.plugin'
import { connectProducer } from './infrastructure/kafka/kafka'

const server = Fastify({ logger: true }) // Initialize Fastify server instance (use logger plugin instaead)

// Register plugins
server.register(logger)

// Register routes
server.register(authPlugin)
server.register(userRoutes, { prefix: '/users' })
server.register(healthRoute)

const start = async () => {
    try {
        await connectProducer() // Connect Kafka producer
        await server.listen({ port: 3000, host: '0.0.0.0' })
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
