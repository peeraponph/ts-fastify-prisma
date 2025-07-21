// services/user-service/src/application/__tests__/user.service.spec.ts

import { UserService } from '../services/user.service'
import { UserRepository } from '../ports/user.repository'
import { Role } from '../../generated/prisma'
import { User } from '../../domain/user.entity'

// 🧪 Mock external dependencies
jest.mock('../../application/events/user.producer', () => ({
    publishUserCreated: jest.fn(),
    publishUserUpdated: jest.fn(),
    publishUserDeleted: jest.fn(),
}))

describe('UserService', () => {
    let userService: UserService
    let mockRepo: jest.Mocked<UserRepository>

    beforeEach(() => {
        mockRepo = {
            createUser: jest.fn(),
            listUsers: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByEmail: jest.fn(),
        }

        userService = new UserService(mockRepo)
    })

    it('should create a user and save to DB', async () => {
        const input = {
            name: 'Alice',
            email: 'alice@example.com',
            password: 'secret',
            role: Role.USER,
            group: 'group-1',
        }

        const savedUser = {
            ...input,
            id: 1,
            createdAt: new Date(),
        }

        mockRepo.findByEmail.mockResolvedValue(null)
        mockRepo.createUser.mockResolvedValue(savedUser)

        const result = await userService.createUser(input)

        expect(mockRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({
            email: input.email,
        }))
        expect(result).toEqual(savedUser)
    })

    it('should update a user if exists', async () => {
        const beforeUser: User = {
            id: 1,
            name: 'before',
            email: 'before@example.com',
            password: 'hashed',
            group: 'groupA',
            role: 'USER',
            createdAt: new Date(),
        }

        const updatedUser: User = {
            ...beforeUser,
            name: 'after',
        }

        mockRepo.findById.mockResolvedValue(beforeUser)
        mockRepo.findByEmail.mockResolvedValue(null)
        mockRepo.update.mockResolvedValue(updatedUser)

        const result = await userService.updateUser(1, {
            name: 'after',
            email: 'before@example.com',
        })

        expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'after' }))
        expect(result).toEqual(updatedUser)
    })

    it('should delete user if exists', async () => {
        const userToDelete: User = {
            id: 1,
            name: 'to-delete',
            email: 'delete@example.com',
            password: 'hashed',
            group: 'test',
            role: 'USER',
            createdAt: new Date(),
        }

        mockRepo.findById.mockResolvedValue(userToDelete)
        mockRepo.delete.mockResolvedValue(userToDelete)

        await userService.deleteUser(userToDelete.id)

        expect(mockRepo.delete).toHaveBeenCalledWith(userToDelete.id)
    })

    it('should throw error if user not found on update', async () => {
        mockRepo.findById.mockResolvedValue(null)

        await expect(userService.updateUser(1, { name: 'X' }))
            .rejects
            .toThrow('User not found')
    })
})
