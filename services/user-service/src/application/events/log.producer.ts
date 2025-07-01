//  src/services/user-service/src/application/events/userlog.producer.ts

import { producer } from '../../infrastructure/kafka/kafka'
import { LogProducerPort, UserLogEvent } from '../ports/log.producer'
import { KafkaUserLogTopic } from '../../infrastructure/kafka/topic'


export class UserLogProducerService implements LogProducerPort {
    async sendUserLogEvent(event: UserLogEvent): Promise<void> {
        await producer.send({
            topic: KafkaUserLogTopic.USER_LOG,
            messages: [
                {
                    key: event.eventType,
                    value: JSON.stringify(event),
                },
            ],
        })
    }
}
