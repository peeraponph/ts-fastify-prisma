import { UserCreatedEvent } from 'event-types'

export const handleUserCreated = async (event: UserCreatedEvent) => {
    console.log(`📨 [Notification] Welcome email sent to ${event.email} (${event.name})`)
}
