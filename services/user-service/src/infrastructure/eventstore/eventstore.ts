// src/infrastructure/eventstore/eventstore.ts
import { EventStoreDBClient, jsonEvent } from '@eventstore/db-client';

export const eventStore = EventStoreDBClient.connectionString(
    'esdb://localhost:2113?tls=false' 
);
