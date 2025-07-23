// user-service/src/infrastructure/clients/outboxClient.ts

import { PrismaClient } from '../../generated/outbox-prisma'

export const outboxPrisma = new PrismaClient()
