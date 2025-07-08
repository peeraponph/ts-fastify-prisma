import { Counter, Histogram } from 'prom-client'
import { register } from './index' 

export const kafkaConsumeDurationHistogram = new Histogram({
    name: 'kafka_consume_duration_seconds',
    help: 'Kafka message consume duration in seconds',
    labelNames: ['topic'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
})
register.registerMetric(kafkaConsumeDurationHistogram)

// Kafka consume success
export const kafkaConsumeSuccessCounter = new Counter({
    name: 'kafka_consume_success_total',
    help: 'Total successfully processed Kafka messages',
    labelNames: ['topic'],
})
register.registerMetric(kafkaConsumeSuccessCounter)

// Kafka consume error
export const kafkaConsumeErrorCounter = new Counter({
    name: 'kafka_consume_error_total',
    help: 'Total Kafka consume errors',
    labelNames: ['topic'],
})
register.registerMetric(kafkaConsumeErrorCounter)
