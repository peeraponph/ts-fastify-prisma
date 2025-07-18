// services/outbox-service/test/utils/setupTestDB.ts

import { prisma } from '../../src/infrastructure/prisma/prisma'


export async function setupTestDB() {
    await prisma.outbox.deleteMany()
}
