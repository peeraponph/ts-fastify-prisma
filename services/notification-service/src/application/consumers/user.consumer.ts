import { consumer } from '../../infrastructure/kafka/kafka'
import { KafkaTopic } from '../../infrastructure/kafka/topic'

export async function startUserEventConsumer() {
    await consumer.connect()
    await consumer.subscribe({ topic: KafkaTopic.USER_CREATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaTopic.USER_UPDATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaTopic.USER_DELETED, fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const payload = message.value?.toString()
            const parsed = payload ? JSON.parse(payload) : null

            if (!parsed) return

            switch (topic) {
                case KafkaTopic.USER_CREATED:
                    console.log(`📥 Received USER_CREATED`, parsed)
                    break
                case KafkaTopic.USER_UPDATED:
                    console.log(`📥 Received USER_UPDATED`, parsed)
                    break
                case KafkaTopic.USER_DELETED:
                    console.log(`📥 Received USER_DELETED`, parsed)
                    break
            }
        },
    })
}
