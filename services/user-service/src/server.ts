// services/user-service/src/server.ts
import './infrastructure/tracing/opentelemetry'
import Fastify from 'fastify'
import userRoutes from './presentation/routes/user.route'
import authRoutes from './presentation/routes/auth.route'
import healthRoute from './presentation/routes/health.route'
import authPlugin from './infrastructure/auth/auth.plugin'
import { connectProducer } from './infrastructure/kafka/kafka'
import { startTelemetry } from './infrastructure/tracing/opentelemetry'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

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

// Global error handler
server.setErrorHandler(async (error, request, reply) => {
    request.log.error(error)

    if (error.validation) {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: error.validation
        })
    }

    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    })
})

// Setup Swagger
async function setupSwagger() {
    await server.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'User Service API',
                description: 'API documentation for managing users',
                version: '1.0.0',
            },
            host: 'localhost:5000',
            schemes: ['http', 'https'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
                { name: 'User', description: 'User management endpoints' },
                { name: 'Health', description: 'Health check endpoints' }
            ],
            securityDefinitions: {
                Bearer: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'JWT token for authentication'
                }
            },
            security: [{ Bearer: [] }]
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

// Register plugins and routes
async function setupServer() {
    // Register auth plugin first
    await server.register(authPlugin)

    // Register Swagger
    await setupSwagger()

    // Register routes
    await server.register(userRoutes, { prefix: '/api/v1/users' })
    await server.register(authRoutes, { prefix: '/auth' })
    await server.register(healthRoute, { prefix: '/api/v1' })
}

// Graceful Shutdown แบบเร็ว (สำหรับ Dev)
async function fastShutdown() {
    console.log('\n⚠️  Force shutting down...')
    await server.close().catch(() => { }) // ปิด Fastify แบบไม่ต้องรอ
    process.exit(0) // ออกทันที
}

// ใช้ `SIGINT` (Ctrl+C) และ `SIGTERM` เพื่อปิดเร็ว
process.on('SIGINT', fastShutdown)
process.on('SIGTERM', fastShutdown)

async function startServer() {
    try {
        await connectProducer()
        await startTelemetry()
        await setupServer()

        await server.ready()
        await server.listen({ port: 5000, host: '0.0.0.0' })

        server.log.info('🚀 User Service running at http://localhost:5000')
        server.log.info('📚 Swagger docs available at http://localhost:5000/docs')
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

startServer()