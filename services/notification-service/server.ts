import { startUserEventConsumer } from './src/application/consumers/user.consumer'

async function start() {
    await startUserEventConsumer()
    console.log('✅ noti-service Kafka consumer started')
}

start()
