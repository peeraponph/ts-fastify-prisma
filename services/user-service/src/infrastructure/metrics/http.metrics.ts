// services/user-service/src/infrastructure/metrics/http.metrics.ts

import { Counter, Histogram } from 'prom-client'

export const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
})

export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

export const httpErrorCounter = new Counter({
    name: 'http_errors_total',
    help: 'Total number of failed HTTP requests',
    labelNames: ['route', 'method', 'status_code']
})  