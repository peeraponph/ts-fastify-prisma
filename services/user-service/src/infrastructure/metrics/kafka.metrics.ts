import { Counter, Histogram } from 'prom-client'
import { register } from './register'

export const kafkaProduceSuccessCounter = new Counter({
    name: 'kafka_produce_success_total',
    help: 'Total Kafka messages successfully produced',
    labelNames: ['topic'],
})
register.registerMetric(kafkaProduceSuccessCounter)

export const kafkaProduceErrorCounter = new Counter({
    name: 'kafka_produce_error_total',
    help: 'Total Kafka produce errors',
    labelNames: ['topic'],
})
register.registerMetric(kafkaProduceErrorCounter)

export const kafkaProduceDurationHistogram = new Histogram({
    name: 'kafka_produce_duration_seconds',
    help: 'Kafka produce latency in seconds',
    labelNames: ['topic'],
    buckets: [0.01, 0.05, 0.1, 0.3, 1, 3, 5],
})
register.registerMetric(kafkaProduceDurationHistogram)
