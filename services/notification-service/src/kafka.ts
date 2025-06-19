import { Kafka } from 'kafkajs'

export const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: ['host.docker.internal:9092'],
})

export const consumer = kafka.consumer({ groupId: 'notification-group' })
