// import { consumer } from './kafka'
import { handleUserCreated } from './handler/user-created.handler'

import { Kafka } from 'kafkajs'

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: ['host.docker.internal:9092'],  // หรือใช้ host.docker.internal ถ้ารันใน container
})

const consumer = kafka.consumer({ groupId: 'notification-group' })

const start = async () => {
    await consumer.connect()

    await consumer.subscribe({ topic: 'user-events', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ message, partition, topic }) => {
            const value = message.value?.toString()
            console.log(`[${topic}][p${partition}] received: ${value}`)

            try {
                const data = JSON.parse(value || '{}')
                await handleUserCreated(data)
            } catch (err) {
                console.error('❌ Failed to handle user.created:', err)
            }
        }
    })
}

start().catch(console.error)
