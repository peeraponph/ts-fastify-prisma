// service/outbox-service/src/infrastructure/metrics/outbox.metrics.ts

import { Counter, Histogram } from 'prom-client'
import { register } from './index'

// count number of successfully produced Kafka messages
export const outboxKafkaSuccessCounter = new Counter({
    name: 'outbox_kafka_produce_success_total',
    help: 'Total number of outbox messages successfully produced to Kafka',
    labelNames: ['event_type'],
})

// count number of failed Kafka produce attempts
export const outboxKafkaErrorCounter = new Counter({
    name: 'outbox_kafka_produce_error_total',
    help: 'Total number of outbox messages failed to produce to Kafka',
    labelNames: ['event_type'],
})

// time to produce event
export const outboxKafkaProduceDuration = new Histogram({
    name: 'outbox_kafka_produce_duration_seconds',
    help: 'Kafka produce duration for outbox messages',
    labelNames: ['event_type'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
})

// ต้อง register มิฉะนั้นจะไม่ถูก export ที่ /metrics
register.registerMetric(outboxKafkaSuccessCounter)
register.registerMetric(outboxKafkaErrorCounter)
register.registerMetric(outboxKafkaProduceDuration)
