
export type UserLogEvent = {
    eventType: string
    actor: string
    targetUser: Record<string, any>
    changes?: Record<string, { before: any; after: any }>
    timestamp: string
}

export interface LogProducerPort {
    sendUserLogEvent(event: UserLogEvent): Promise<void>
}