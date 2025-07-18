// services/notification-service/test/utils/setupKafkaConsumerForTest.ts

import { startUserEventConsumer } from '../../src/application/consumers/user.consumer'

export async function setupConsumerForTest() {
    await startUserEventConsumer()
}
