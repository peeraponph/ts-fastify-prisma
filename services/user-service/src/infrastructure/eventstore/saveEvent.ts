// src/infrastructure/eventstore/saveEvent.ts
import { jsonEvent, FORWARDS, START } from '@eventstore/db-client';
import { eventStore } from './eventstore';

export async function appendUserEvent(userId: string, eventType: string, payload: any) {
    const event = jsonEvent({
        type: eventType,
        data: payload,
    });

    const streamName = `user-${userId}`;
    await eventStore.appendToStream(streamName, [event]);
}
