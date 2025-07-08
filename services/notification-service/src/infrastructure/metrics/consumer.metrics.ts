import { Counter, Histogram } from 'prom-client'
import { register } from './index' // <== สำคัญ ต้องมาหลังจากประกาศ register แล้ว

export const kafkaConsumeSuccessCounter = new Counter({
    name: 'kafka_consume_success_total',
    help: 'Total Kafka messages successfully consumed',
    labelNames: ['topic'],
})
register.registerMetric(kafkaConsumeSuccessCounter)

export const kafkaConsumeErrorCounter = new Counter({
    name: 'kafka_consume_error_total',
    help: 'Total Kafka consume errors',
    labelNames: ['topic'],
})
register.registerMetric(kafkaConsumeErrorCounter)

export const kafkaConsumeDurationHistogram = new Histogram({
    name: 'kafka_consume_duration_seconds',
    help: 'Kafka consume latency in seconds',
    labelNames: ['topic'],
    buckets: [0.01, 0.05, 0.1, 0.3, 1, 3, 5],
})
register.registerMetric(kafkaConsumeDurationHistogram)
