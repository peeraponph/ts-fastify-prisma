// service/user-service/src/application/events/user.producer.ts
import { trace } from '@opentelemetry/api'
import { producer } from '../../infrastructure/kafka/kafka'
import { KafkaUserTopic } from '../../infrastructure/kafka/topic'
import { User } from '../../domain/user.entity'

const tracer = trace.getTracer('user-service')

async function sendKafkaEvent(topic: string, key: string, value: any, label: string) {
    const span = tracer.startSpan(`kafka.produce.${topic}`)

    try {
        const payload = JSON.stringify(value)

        await producer.send({
            topic,
            messages: [{ key, value: payload }],
        })

        span.setAttributes({
            'messaging.system': 'kafka',
            'messaging.destination': topic,
            'messaging.kafka.message_key': key,
            'messaging.operation': 'send',
        })

        span.setStatus({ code: 1 })
        console.log(`📤 Kafka | Sent ${label} for key ${key}`)

    } catch (err) {
        if (err instanceof Error) {
            span.recordException(err)
            span.setStatus({ code: 2, message: err.message })
        } else {
            span.recordException(new Error('Unknown error'))
            span.setStatus({ code: 2, message: String(err) })
        }
        throw err
    } finally {
        span.end()
    }
}

export async function publishUserCreated(user: User) {
    await sendKafkaEvent(
        KafkaUserTopic.USER_CREATED,
        user.id.toString(),
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            group: user.group,
        },
        'USER_CREATED'
    )
}

export async function publishUserUpdated(user: User) {
    await sendKafkaEvent(
        KafkaUserTopic.USER_UPDATED,
        user.id.toString(),
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            group: user.group,
        },
        'USER_UPDATED'
    )
}

export async function publishUserDeleted(userId: number) {
    await sendKafkaEvent(
        KafkaUserTopic.USER_DELETED,
        userId.toString(),
        { id: userId },
        'USER_DELETED'
    )
}
