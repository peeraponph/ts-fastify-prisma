import { Prisma, User as PrismaUser } from '../../generated/prisma'
import { prisma } from '../prisma/prisma'
import { UserRepository } from '../../application/ports/user.repository'
import { redis } from '../cache/redis'

export const userRepository: UserRepository = {
    async createUser(data: Prisma.UserCreateInput): Promise<PrismaUser> {
        return prisma.user.create({ data })
    },

    async findByEmail(email: string): Promise<PrismaUser | null> {
        return prisma.user.findUnique({ where: { email } })
    },

    async findById(id: number): Promise<PrismaUser | null> {
        const cached = await redis.get(`user:${id}`)
        if (cached) return JSON.parse(cached)

        const user = await prisma.user.findUnique({ where: { id } })
        if (user) await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 60 * 5) // 5 mins
        return user
    },

    async update(id: number, data: Prisma.UserUpdateInput): Promise<PrismaUser> {
        const updated = await prisma.user.update({ where: { id }, data })
        await redis.del(`user:${id}`)
        return updated
    },

    async delete(id: number): Promise<void> {
        await prisma.user.delete({ where: { id } })
        await redis.del(`user:${id}`)
    },

    async listUsers(): Promise<PrismaUser[]> {
        const cacheKey = 'users:all'
        const cached = await redis.get(cacheKey)
        if (cached) {
            return JSON.parse(cached)
        }
        
        const users = await prisma.user.findMany()
        await redis.set(cacheKey, JSON.stringify(users), 'EX', 60) // expire 60 sec
        return users
    },
}
