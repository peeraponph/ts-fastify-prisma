// services/outbox-service/src/infrastructure/kafka/kafka.ts

import { Kafka, Producer } from 'kafkajs'

export const kafka = new Kafka({
    clientId: 'outbox-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
})

const defaultProducer = kafka.producer()
let kafkaProducer: Producer | null = null

export async function connectProducer() {
    await defaultProducer.connect()
    console.log('✅ Kafka Producer connected (outbox-service)')
}

// ✅ Use default unless explicitly mocked
export function getKafkaProducer(): Producer {
    return kafkaProducer ?? defaultProducer
}

export function setKafkaProducer(mock: Producer) {
    kafkaProducer = mock
}
