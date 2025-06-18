// src/server.ts
import Fastify from 'fastify'
import userRoutes from './routes/user'
import healthcheckPlugin from './plugins/healtcheck'

const server = Fastify({ logger: true })

server.register(healthcheckPlugin)
server.register(userRoutes, { prefix: '/users' })

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' })
        console.log('Server is running at http://localhost:3000')
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
