// services/user-service/src/server.ts
import './infrastructure/tracing/opentelemetry'
import Fastify from 'fastify'
import userRoutes from './presentation/routes/user.route'
import healthRoute from './presentation/routes/health.route'
import logger from './presentation/plugins/logger'
import authPlugin from './infrastructure/auth/auth.plugin'
import { connectProducer } from './infrastructure/kafka/kafka'
import { startTelemetry } from './infrastructure/tracing/opentelemetry'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

const server = Fastify({ logger: true })

// Register routes
async function registerRoutes() {
    await server.register(userRoutes, { prefix: '/users' })
    await server.register(healthRoute)
}

// Register all plugins with type assertion
async function setupPlugins() {
    await server.register(logger)
    await server.register(authPlugin)
}

// Register Swagger documentation
async function setupSwagger() {
    await server.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'User Service API',
                description: 'API documentation for managing users',
                version: '1.0.0',
            },
            tags: [{ name: 'User', description: 'User management endpoints' }],
            host: 'localhost:5000',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
        }
    })

    await server.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: false,
        transformStaticCSP: (header) => header,
    })

    server.get('/', async (request, reply) => {
        return reply.redirect('/docs')
    })
}

async function startServer() {
    try {
        await connectProducer()
        await startTelemetry()
        await setupPlugins()
        await setupSwagger()
        await registerRoutes()

        await server.ready()
        await server.listen({ port: 5000, host: '0.0.0.0' })

        server.log.info('User-service running at http://localhost:5000')
        server.log.info('Swagger docs available at http://localhost:5000/docs')
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

startServer()