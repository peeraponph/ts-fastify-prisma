// services/notification-service/src/application/consumers/user.consumer.ts
import { kafka } from '../../infrastructure/kafka/kafka'
import { KafkaUserTopic } from '../../infrastructure/kafka/topic'

export async function startUserEventConsumer() {
    const consumer = kafka.consumer({ groupId: 'user-event-consumer' })
    
    await consumer.connect()

    await consumer.subscribe({ topic: KafkaUserTopic.USER_CREATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaUserTopic.USER_UPDATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaUserTopic.USER_DELETED, fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const data = JSON.parse(message.value?.toString() || '{}')
            console.log(`📩 [UserEvent] ${topic}:`, data)

            // TODO: Save to DB / Notification system
        },
    })

    console.log('✅ User event consumer started')
}
