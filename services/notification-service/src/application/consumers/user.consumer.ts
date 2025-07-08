import { kafka } from '../../infrastructure/kafka/kafka'
import { KafkaUserTopic } from '../../infrastructure/kafka/topic'

import {
    kafkaConsumeSuccessCounter,
    kafkaConsumeErrorCounter,
    kafkaConsumeDurationHistogram,
} from '../../infrastructure/metrics/consumer.metrics'

export async function startUserEventConsumer() {
    const consumer = kafka.consumer({ groupId: 'notification-user-consumer' })

    await consumer.connect()

    await consumer.subscribe({ topic: KafkaUserTopic.USER_CREATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaUserTopic.USER_UPDATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaUserTopic.USER_DELETED, fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const start = process.hrtime()
            try {
                const data = JSON.parse(message.value?.toString() || '{}')
                console.log(`📩 [UserEvent] ${topic}:`, data)

                // TODO: Save to DB / Notification system

                // ✅ Metric success
                kafkaConsumeSuccessCounter.labels(topic).inc()
            } catch (err) {
                // ❌ Metric error
                kafkaConsumeErrorCounter.labels(topic).inc()
                console.error(`❌ [UserEvent Error] ${topic}:`, err)
            } finally {
                const diff = process.hrtime(start)
                const durationInSec = diff[0] + diff[1] / 1e9
                kafkaConsumeDurationHistogram.labels(topic).observe(durationInSec)
            }
        },
    })

    console.log('✅ User event consumer started')
}
