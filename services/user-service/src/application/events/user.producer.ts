// src/application/events/user.producer.ts
import { producer } from '../../infrastructure/kafka/kafka'
import { KafkaTopic } from '../../infrastructure/kafka/topic'
import { User } from '../../domain/user.entity'
  
export async function publishUserCreated(user: User) {
    await producer.send({
        topic: KafkaTopic.USER_CREATED,
        messages: [
            {
                key: user.id.toString(),
                value: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    group: user.group,
                }),
            },
        ],
    })

    console.log(`📤 Kafka | Sent USER_CREATED for ID ${user.id}`)
}

export async function publishUserUpdated(user: User) {
    await producer.send({
        topic: KafkaTopic.USER_UPDATED,
        messages: [
            {
                key: user.id.toString(),
                value: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    group: user.group,
                }),
            },
        ],
    })

    console.log(`📤 Kafka | Sent USER_UPDATED for ID ${user.id}`)
}

export async function publishUserDeleted(userId: number) {
    await producer.send({
        topic: KafkaTopic.USER_DELETED,
        messages: [
            {
                key: userId.toString(),
                value: JSON.stringify({ id: userId }),
            },
        ],
    })
    console.log(`📤 Kafka | Sent USER_DELETED for ID ${userId}`)
}