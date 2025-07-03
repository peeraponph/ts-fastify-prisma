// services/user-service/src/presentation/plugins/logger.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import pino from 'pino'

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss dd-mm-yyyy',
            ignore: 'pid,hostname'
        }
    }
})

export default async function loggerPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.log = logger
}