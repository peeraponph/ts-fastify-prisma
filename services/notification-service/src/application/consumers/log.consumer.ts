import { Consumer, EachMessagePayload } from 'kafkajs'
import { consumer } from '../../infrastructure/kafka/kafka'     
import { KafkaUserLogTopic } from '../../infrastructure/kafka/topic'
import { prisma } from '../../infrastructure/prisma/prisma'

export const startLogConsumer = async () => {
    await consumer.connect()
    await consumer.subscribe({ topic: KafkaUserLogTopic.USER_LOG, fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ topic, message }: EachMessagePayload) => {
            if (!message.value) return
            const logEvent = JSON.parse(message.value.toString())

            console.log('📥 Received log event:', logEvent.eventType)

            await prisma.userLog.create({
                data: {
                    eventType: logEvent.eventType,
                    actor: logEvent.actor,
                    targetUser: logEvent.targetUser,
                    changes: logEvent.changes || null,
                    timestamp: logEvent.timestamp,
                },
            })
        },
    })

    console.log('✅ Log consumer started')
}
