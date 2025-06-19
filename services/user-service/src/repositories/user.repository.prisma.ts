import { prisma } from '../prisma'
import { UserRepository } from './user.repository'
import { User } from '../domain/user.entity'

export const userRepositoryPrisma: UserRepository = {
    async create(data) {
        return await prisma.user.create({ data })
    },
    async findAll() {
        return await prisma.user.findMany()
    }
}
