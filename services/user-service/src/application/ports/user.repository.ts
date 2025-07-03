// services/user-service/src/application/ports/user.repository.ts
import { Prisma, User as PrismaUser } from '../../generated/prisma'

export interface ListUsersOptions {
    page?: number
    limit?: number
    search?: string
    role?: 'USER' | 'ADMIN'
}

export interface PaginatedResult<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export interface UserRepository {
    createUser(data: Prisma.UserCreateInput): Promise<PrismaUser>
    findById(id: number): Promise<PrismaUser | null>
    findByEmail(email: string): Promise<PrismaUser | null>
    listUsers(options?: ListUsersOptions): Promise<PaginatedResult<PrismaUser>>
    update(id: number, data: Prisma.UserUpdateInput): Promise<PrismaUser>
    delete(id: number): Promise<PrismaUser>
}