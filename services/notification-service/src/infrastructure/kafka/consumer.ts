// service/notification-service/src/infrastructure/kafka/consumer.ts

import { startUserEventConsumer } from '../../application/consumers/user.consumer'
import { startLogConsumer } from '../../application/consumers/log.consumer'

export async function startKafkaConsumers() {
    await startUserEventConsumer()
    await startLogConsumer()
}
