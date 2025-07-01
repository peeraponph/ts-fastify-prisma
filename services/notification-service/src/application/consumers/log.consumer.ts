// services/notification-service/src/application/consumers/log.consumer.ts
import { kafka } from '../../infrastructure/kafka/kafka'
import { KafkaUserLogTopic } from '../../infrastructure/kafka/topic'
import { UserLogEvent } from '../port/log.consumer'
import { PrismaClient } from '../../generated/prisma'
import { Consumer } from 'kafkajs'

const prisma = new PrismaClient()

export async function startLogConsumer() {
    const consumer: Consumer = kafka.consumer({ groupId: 'user-log-consumer' }) 
    await consumer.connect()
    await consumer.subscribe({ topic: KafkaUserLogTopic.USER_LOG, fromBeginning: true })

    console.log('✅ Log event consumer started')

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return

            try {
                const data: UserLogEvent = JSON.parse(message.value.toString())

                switch (data.eventType) {
                    case 'user.log.created':
                        await prisma.userLog.create({
                            data: {
                                eventType: data.eventType,
                                actor: data.actor,
                                targetUser: data.targetUser,
                                changes: data.changes || undefined,
                                timestamp: data.timestamp,
                            },
                        })
                        break
                    case 'user.log.updated':
                        await prisma.userLog.create({
                            data: {
                                eventType: data.eventType,
                                actor: data.actor,
                                targetUser: data.targetUser,
                                changes: data.changes || undefined,
                                timestamp: data.timestamp,
                            },
                        })
                        break
                    case 'user.log.deleted':
                        await prisma.userLog.create({
                            data: {
                                eventType: data.eventType,
                                actor: data.actor,
                                targetUser: data.targetUser,
                                changes: data.changes || undefined,
                                timestamp: data.timestamp,
                            },
                        })
                        break
                    default:
                        console.warn(`⚠️ Unknown user log event type: ${data.eventType}`)
                }

                console.log(`📥 Logged user event: ${data.eventType} by ${data.actor}`)
            } catch (err) {
                console.error('❌ Failed to store user log:', err)
            }
        },
    })
}
