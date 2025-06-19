import { consumer } from './kafka'
import { handleUserCreated } from './handler/user-created.handler'

const start = async () => {
    await consumer.connect()
    await consumer.subscribe({ topic: 'user-events', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ message, partition, topic }) => {
            const value = message.value?.toString()
            console.log(`[${topic}][p${partition}] received: ${value}`)

            try {
                const data = JSON.parse(value || '{}')
                await handleUserCreated(data)
            } catch (err) {
                console.error('❌ Failed to handle user.created:', err)
            }
        }
    })
}

start().catch(console.error)
