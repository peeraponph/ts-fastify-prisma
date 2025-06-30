//  service/user-service/src/application/ports/user.repository.ts

import { Prisma, User as PrismaUser } from '../../generated/prisma'

export interface UserRepository {
    createUser(data: Prisma.UserCreateInput): Promise<PrismaUser>
    findById(id: number): Promise<PrismaUser | null>
    findByEmail(email: string): Promise<PrismaUser | null>
    listUsers(): Promise<PrismaUser[]>
    update(id: number, data: Prisma.UserUpdateInput): Promise<PrismaUser>
    delete(id: number): Promise<PrismaUser>
}
