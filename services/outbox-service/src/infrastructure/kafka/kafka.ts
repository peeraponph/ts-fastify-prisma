// service/outbox-service/src/infrastructure/kafka/kafka.ts

import { Kafka } from 'kafkajs'

export const kafka = new Kafka({
    clientId: 'outbox-service',
    brokers: ['localhost:9092'], // หรือ ENV เช่น process.env.KAFKA_BROKERS
})

export const producer = kafka.producer()

export async function connectProducer() {
    await producer.connect()
    console.log('✅ Kafka Producer connected (outbox-service)')
}
