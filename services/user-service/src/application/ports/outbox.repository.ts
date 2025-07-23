export interface OutboxRepository {
    writeOutboxEvent(params: {
        topic: string
        key: string
        eventType: string
        payload: any
        headers?: Record<string, string>
    }): Promise<void>
}