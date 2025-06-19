import { userRepositoryPrisma } from '../repositories/user.repository.prisma'
import { publishUserCreated } from '../events/user.producer'
import { User } from '../domain/user.entity'

export const createUser = async (name: string, email: string): Promise<User> => {
    const user = await userRepositoryPrisma.create({ name, email })
    await publishUserCreated(user)
    return user
}

export const getAllUsers = async (): Promise<User[]> => {
    return userRepositoryPrisma.findAll()
}
