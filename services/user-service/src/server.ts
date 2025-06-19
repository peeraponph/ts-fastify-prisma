import Fastify from 'fastify'
import userRoutes from './routes/user.route'
import healthcheckPlugin from './plugins/healtcheck'
import { producer } from './kafka'

const server = Fastify({ logger: true })

server.register(healthcheckPlugin)
server.register(userRoutes, { prefix: '/users' })

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
