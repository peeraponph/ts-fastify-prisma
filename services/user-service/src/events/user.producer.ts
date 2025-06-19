import { producer } from '../kafka'
import { User } from '../domain/user.entity'

export const publishUserCreated = async (user: User) => {
    await producer.send({
        topic: 'user-events',
        messages: [
            {
                key: 'user.created',
                value: JSON.stringify(user),
            },
        ],
    })
}
