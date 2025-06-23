import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
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

export default fp(async function (fastify: FastifyInstance) {
    fastify.log = logger
})
