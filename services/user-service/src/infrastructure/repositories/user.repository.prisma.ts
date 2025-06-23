import { Prisma, User as PrismaUser } from '../../generated/prisma'
import { prisma } from '../prisma/prisma'
import { UserRepository } from '../../application/ports/user.repository'

export const userRepository: UserRepository = {
    async createUser(data: Prisma.UserCreateInput): Promise<PrismaUser> {
        return prisma.user.create({ data })
    },

    async findByEmail(email: string): Promise<PrismaUser | null> {
        return prisma.user.findUnique({ where: { email } })
    },

    async findById(id: number): Promise<PrismaUser | null> {
        return prisma.user.findUnique({ where: { id } })
    },

    async update(id: number, data: Prisma.UserUpdateInput): Promise<PrismaUser> {
        return prisma.user.update({ where: { id }, data })
    },

    async delete(id: number): Promise<void> {
        await prisma.user.delete({ where: { id } })
    },

    async listUsers(): Promise<PrismaUser[]> {
        return prisma.user.findMany()
    },
}
