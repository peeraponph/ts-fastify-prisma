//  service/notification-service/src/application/consumers/user.consumer.ts

import { kafka } from '../../infrastructure/kafka/kafka'
import { KafkaUserTopic } from '../../infrastructure/kafka/topic'
import { trace, context, propagation } from '@opentelemetry/api'
import { IHeaders } from 'kafkajs'

import {
    kafkaConsumeSuccessCounter,
    kafkaConsumeErrorCounter,
    kafkaConsumeDurationHistogram,
} from '../../infrastructure/metrics/consumer.metrics'


function decodeKafkaHeaders(headers: IHeaders = {}): Record<string, string> {
    const decoded: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
        if (Buffer.isBuffer(value)) {
            decoded[key] = value.toString()
        } else if (typeof value === 'string') {
            decoded[key] = value
        } else if (Array.isArray(value)) {
            decoded[key] = value.map((v) => (Buffer.isBuffer(v) ? v.toString() : String(v))).join(',')
        } else if (value !== undefined) {
            decoded[key] = String(value)
        }
        // ถ้า undefined ก็ไม่ต้อง set
    }
    return decoded
}

export async function startUserEventConsumer() {
    const consumer = kafka.consumer({ groupId: 'notification-user-consumer' })

    await consumer.connect()

    await consumer.subscribe({ topic: KafkaUserTopic.USER_CREATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaUserTopic.USER_UPDATED, fromBeginning: true })
    await consumer.subscribe({ topic: KafkaUserTopic.USER_DELETED, fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            // 🔁 Decode headers
            const decodedHeaders = decodeKafkaHeaders(message.headers ?? {})

            // 🎯 Extract parent context from trace headers
            const parentCtx = propagation.extract(context.active(), decodedHeaders)

            // 🔍 Debug: show extracted trace context
            console.log('TRACE FROM CONSUMER:', trace.getSpan(parentCtx)?.spanContext())

            // 🟠 Start span with parent context
            const span = trace.getTracer('notification-service').startSpan(
                `consume.${topic}`,
                undefined,
                parentCtx
            )

            await context.with(trace.setSpan(context.active(), span), async () => {
                const start = process.hrtime()

                try {
                    const data = JSON.parse(message.value?.toString() || '{}')
                    console.log(`📩 [UserEvent] ${topic}:`, data)

                    // TODO: Save to DB / Trigger Notification here

                    // ✅ Metric success
                    kafkaConsumeSuccessCounter.labels(topic).inc()
                } catch (err) {
                    // ❌ Metric error
                    kafkaConsumeErrorCounter.labels(topic).inc()
                    console.error(`❌ [UserEvent Error] ${topic}:`, err)
                } finally {
                    const [sec, nano] = process.hrtime(start)
                    const durationInSec = sec + nano / 1e9
                    kafkaConsumeDurationHistogram.labels(topic).observe(durationInSec)
                    span.end()
                }
            })
        },
    })

    console.log('✅ User event consumer started')
}
