// src/infrastructure/prisma/tracing-middleware.ts
// import { trace } from '@opentelemetry/api'
// import type { Prisma } from '@prisma/client'

// export const tracingMiddleware: Prisma.Middleware = async (params, next) => {
//     const tracer = trace.getTracer('user-service')
//     const span = tracer.startSpan(`prisma.${params.model}.${params.action}`)

//     try {
//         const result = await next(params)
//         span.setStatus({ code: 1 })
//         return result
//     } catch (err) {
//         span.recordException(err as Error)
//         span.setStatus({ code: 2, message: String(err) })
//         throw err
//     } finally {
//         span.end()
//     }
// }
