// services/outbox-service/tests/__mocks__/mockKafkaProducer.ts

import { vi } from 'vitest'
import type { Producer, ProducerRecord, RecordMetadata } from 'kafkajs'

export const mockSend = vi.fn<() => Promise<any[]>>(() => Promise.resolve([]))
export const mockConnect = vi.fn<() => Promise<void>>()
export const mockDisconnect = vi.fn<() => Promise<void>>()

export const mockKafkaProducer: Partial<Producer> = {
    send: mockSend,
    connect: mockConnect,
    disconnect: mockDisconnect,
}


// Utility function for test setup
export function resetKafkaProducerMocks() {
    mockSend.mockReset()
    mockConnect.mockReset()
    mockDisconnect.mockReset()
}
