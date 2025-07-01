//  src/application/port/log.consumer.ts
export interface UserLogEvent {
    eventType: 'user.log.created' | 'user.log.updated' | 'user.log.deleted'
    actor: string
    targetUser: Record<string, any>
    changes?: Record<string, any>
    timestamp: string
}  