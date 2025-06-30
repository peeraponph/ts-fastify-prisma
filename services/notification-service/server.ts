import { startUserEventConsumer } from './src/application/consumers/user.consumer'
import { startLogConsumer } from './src/application/consumers/log.consumer'

async function start() {
    await startUserEventConsumer()
    await startLogConsumer()
}

start()
