// src/server.ts

import * as dotenv from 'dotenv'
dotenv.config()

import Fastify, { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import metricsPlugin from './infrastructure/metrics/metrics.plugin'
import authPlugin from './infrastructure/auth/auth.plugin'
import userRoutes from './presentation/routes/user.route'
import authRoutes from './presentation/routes/auth.route'
import healthRoute from './presentation/routes/health.route'
import { setupOpenTelemetry } from './infrastructure/tracing/otel'
import { connectProducer } from './infrastructure/kafka/kafka'

// Create and configure the Fastify server
export function createServer(): FastifyInstance {
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
        connectionTimeout: 1000
    })

    // Global error handler
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

    return server
}

async function setupSwagger(server: FastifyInstance) {
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

async function setupServer(server: FastifyInstance) {
    await server.register(authPlugin)
    await setupSwagger(server)
    await server.register(userRoutes, { prefix: '/api/v1/users' })
    await server.register(authRoutes, { prefix: '/auth' })
    await server.register(healthRoute, { prefix: '/api/v1' })
}

// Start the server only if this file is run directly
async function startServer() {
    try {
        const server = createServer()
        await setupOpenTelemetry()
        await server.register(metricsPlugin)
        await connectProducer()
        await setupServer(server)
        await server.ready()
        await server.listen({ port: 5000, host: '0.0.0.0' })

        server.log.info('Swagger docs available at http://localhost:5000/docs')
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

if (require.main === module) {
    startServer()
}

// Export the createServer function for testing or other purposes
export async function buildApp(): Promise<FastifyInstance> {
    const app = createServer()
    await setupOpenTelemetry()
    await app.register(metricsPlugin)
    await connectProducer()
    await setupServer(app)
    await app.ready()
    return app
}
