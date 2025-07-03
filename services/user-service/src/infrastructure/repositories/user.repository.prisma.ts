// services/user-service/src/infrastructure/repositories/user.repository.prisma.ts
import { Prisma, User as PrismaUser } from '../../generated/prisma'
import { prisma } from '../prisma/prisma'
import { UserRepository, ListUsersOptions, PaginatedResult } from '../../application/ports/user.repository'
import { redis } from '../cache/redis'

export const userRepository: UserRepository = {
    async createUser(data: Prisma.UserCreateInput): Promise<PrismaUser> {
        const user = await prisma.user.create({ data })

        // Cache the new user
        await redis.setex(`user:${user.id}`, 300, JSON.stringify(user))
        await redis.setex(`user:email:${user.email}`, 300, JSON.stringify(user))

        // Invalidate list cache
        const pattern = 'users:*'
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }

        return user
    },

    async findByEmail(email: string): Promise<PrismaUser | null> {
        const cacheKey = `user:email:${email}`
        const cached = await redis.get(cacheKey)

        if (cached) {
            return JSON.parse(cached)
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (user) {
            await redis.setex(cacheKey, 300, JSON.stringify(user))
        }

        return user
    },

    async findById(id: number): Promise<PrismaUser | null> {
        const cacheKey = `user:${id}`
        const cached = await redis.get(cacheKey)

        if (cached) {
            return JSON.parse(cached)
        }

        const user = await prisma.user.findUnique({ where: { id } })

        if (user) {
            await redis.setex(cacheKey, 300, JSON.stringify(user))
        }

        return user
    },

    async update(id: number, data: Prisma.UserUpdateInput): Promise<PrismaUser> {
        const user = await prisma.user.update({ where: { id }, data })

        // Update cache
        await redis.setex(`user:${id}`, 300, JSON.stringify(user))
        if (user.email) {
            await redis.setex(`user:email:${user.email}`, 300, JSON.stringify(user))
        }

        // Invalidate list cache
        const pattern = 'users:*'
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }

        return user
    },

    async delete(id: number): Promise<PrismaUser> {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            throw new Error('User not found')
        }

        await prisma.user.delete({ where: { id } })

        // Remove from cache
        await redis.del(`user:${id}`)
        await redis.del(`user:email:${user.email}`)

        // Invalidate list cache
        const pattern = 'users:*'
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }

        return user
    },

    async listUsers(options: ListUsersOptions = {}): Promise<PaginatedResult<PrismaUser>> {
        const { page = 1, limit = 10, search, role } = options
        const skip = (page - 1) * limit

        const cacheKey = `users:${JSON.stringify(options)}`
        const cached = await redis.get(cacheKey)

        if (cached) {
            return JSON.parse(cached)
        }

        const where: Prisma.UserWhereInput = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (role) {
            where.role = role
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    group: true,
                    createdAt: true
                    // Exclude password from response
                }
            }),
            prisma.user.count({ where })
        ])

        const result: PaginatedResult<PrismaUser> = {
            data: users as PrismaUser[],
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }

        await redis.setex(cacheKey, 60, JSON.stringify(result))

        return result
    }
}