// services/user-service/src/server.ts
import * as dotenv from 'dotenv'
dotenv.config()

import { setupOpenTelemetry, getOtelPlugin } from './infrastructure/tracing/otel'; 
import { requestTracingPlugin } from "./infrastructure/tracing/request-tracing.plugin"
import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import authPlugin from './infrastructure/auth/auth.plugin'
import { connectProducer } from './infrastructure/kafka/kafka'
import userRoutes from './presentation/routes/user.route'
import authRoutes from './presentation/routes/auth.route'
import healthRoute from './presentation/routes/health.route'


const server = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss dd-mm-yyyy',
                ignore: 'pid,hostname'
            }
        }
    },
    forceCloseConnections: true,
    connectionTimeout: 1000,
})

// 💥 Global error handler
server.setErrorHandler(async (error, request, reply) => {
    request.log.error(error)
    if (error.validation) {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: error.validation,
        })
    }
    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Unexpected error occurred',
    })
})

// 📘 Swagger setup
async function setupSwagger() {
    await server.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'User Service API',
                description: 'API for user management',
                version: '1.0.0',
            },
            host: 'localhost:5000',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            securityDefinitions: {
                Bearer: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'JWT token',
                },
            },
            security: [{ Bearer: [] }],
        },
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

    server.get('/', async (req, reply) => reply.redirect('/docs'))
}

// 🧩 Register plugins and routes
async function setupServer() {
    await server.register(authPlugin)
    await setupSwagger()
    await server.register(userRoutes, { prefix: '/api/v1/users' })
    await server.register(authRoutes, { prefix: '/auth' })
    await server.register(healthRoute, { prefix: '/api/v1' })
}

// ⏹️ Graceful shutdown
async function fastShutdown() {
    console.log('\n⚠️  Force shutting down...')
    await server.close().catch(() => { })
    process.exit(0)
}

process.on('SIGINT', fastShutdown)
process.on('SIGTERM', fastShutdown)

// 🚀 Start server
async function startServer() {
    try {

        await setupOpenTelemetry();
        await server.register(getOtelPlugin().plugin());
        await server.register(requestTracingPlugin)

        await connectProducer()
        await setupServer()

        await server.ready()

        await server.listen({ port: 5000, host: '127.0.0.1' })
        server.log.info('Swagger docs available at http://127.0.0.1:5000/docs')

    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

startServer()