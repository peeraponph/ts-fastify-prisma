// services/user-service/setup/setupTestDB.ts

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

export async function resetTestDB() {
    await prisma.user.deleteMany()
    await prisma.outbox.deleteMany()
}
