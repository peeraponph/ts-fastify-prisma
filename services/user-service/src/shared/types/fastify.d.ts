// src/shared/types/fastify.d.ts
import 'fastify'
import { Span, Context } from '@opentelemetry/api'

declare module 'fastify' {
    interface FastifyRequest {
        otelSpan?: Span
        otelContext?: Context
    }
}




