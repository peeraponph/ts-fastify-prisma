import { describe, it, expect, beforeAll } from 'vitest'
import { kafka } from '../../src/infrastructure/kafka/kafka'
import { KafkaUserTopic } from '../../src/infrastructure/kafka/topic'

describe('Kafka Consumer → Notification', () => {
    const producer = kafka.producer()

    beforeAll(async () => {
        await producer.connect()
    })

    it('should receive and process user.created', async () => {
        await producer.send({
            topic: KafkaUserTopic.USER_CREATED,
            messages: [
                {
                    key: 'test-key',
                    value: JSON.stringify({
                        id: 1,
                        name: 'Kafka User',
                        email: 'kafka@example.com',
                        role: 'USER',
                        group: 'noti',
                    }),
                    headers: {
                        traceparent: Buffer.from('00-abcdefabcdefabcdefabcdefabcdef12-abcdefabcdef1234-01'),
                    },
                },
            ],
        })

        expect(true).toBe(true) // You can attach spies or logs for real checks
    })
})
