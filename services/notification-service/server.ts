import { startKafkaConsumers } from './src/infrastructure/kafka/consumer'


async function start() {
    await startKafkaConsumers()
}

start()
