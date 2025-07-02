// --- Tracing & Monitoring ---
import './infrastructure/tracing/opentelemetry'

// --- Core ---
import Fastify from 'fastify'

// --- Routes & Plugins ---
import userRoutes from './presentation/routes/user.route'
import healthRoute from './presentation/routes/health.route'
import logger from './presentation/plugins/logger'
import authPlugin from './infrastructure/auth/auth.plugin'

// --- Kafka & Telemetry ---
import { connectProducer } from './infrastructure/kafka/kafka'
import { startTelemetry } from './infrastructure/tracing/opentelemetry'

// --- Swagger ---
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

//  instance of Fastify server
const server = Fastify({ logger: true })

// Register routes
async function registerRoutes() {
    await server.register(userRoutes, { prefix: '/users' })
    await server.register(healthRoute)
}

// Register all plugins
async function setupPlugins() {
    await server.register(logger)
    await server.register(authPlugin)
}

// Register Swagger documentation
async function setupSwagger() {
    await server.register(fastifySwagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'User Service API',
                description: 'API documentation for managing users',
                version: '1.0.0',
            },
            tags: [{ name: 'User', description: 'User management endpoints' }],
        },
        exposeRoute: true,
    })

    await server.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: false,
    })

    server.get('/', (_, reply) => reply.redirect('/docs'))

}

async function startServer() {
    try {
        await connectProducer()
        await startTelemetry()
        await registerRoutes()
        await setupPlugins()
        await setupSwagger()

        // Ensure server is ready before starting
        await server.ready()
        server.swagger()

        await server.listen({ port: 5000, host: '0.0.0.0' })
        server.log.info('User-service running at http://localhost:5000')
        server.log.info('Swagger docs available at http://localhost:5000/docs')
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

startServer()
