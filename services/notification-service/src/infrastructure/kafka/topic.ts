//  // services/notification-service/src/infrastructure/kafka/topic.ts
export enum KafkaUserTopic {
    USER_CREATED = 'user.created',
    USER_UPDATED = 'user.updated',
    USER_DELETED = 'user.deleted',
}

export enum KafkaUserLogTopic {
    USER_LOG = 'user.log',
}   