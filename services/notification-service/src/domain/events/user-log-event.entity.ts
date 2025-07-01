export interface UserLogEvent {
    eventType: string
    actor: string
    targetUser: Record<string, any>
    changes?: Record<string, any>
    timestamp: string
}  