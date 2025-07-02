// src/application/__tests__/user.service.spec.ts

import { UserService } from '../services/user.service'
import { UserRepository } from '../ports/user.repository'
import { LogProducerPort } from '../ports/log.producer'
import { User } from '../../domain/user.entity'
import { Role } from '../../generated/prisma'


jest.mock('../../application/events/user.producer', () => ({
    publishUserCreated: jest.fn(),
    publishUserUpdated: jest.fn(),
    publishUserDeleted: jest.fn(),
}))


describe('UserService', () => {
    let userService: UserService
    let mockRepo: jest.Mocked<UserRepository>
    let mockLogProducer: jest.Mocked<LogProducerPort>

    beforeEach(() => {
        mockRepo = {
            createUser: jest.fn(),
            listUsers: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByEmail: jest.fn(),
        }

        mockLogProducer = {
            sendUserLogEvent: jest.fn(),
        }

        userService = new UserService(mockRepo, mockLogProducer)
    })

    it('should create a user and publish events', async () => {
        const input = {
            name: 'Alice',
            email: 'alice@example.com',
            password: 'secret',
            role: Role.USER, 
            group: 'group-1',
        };

        const savedUser = {
            ...input,
            id: 1,
            createdAt: new Date(), 
        };      

        mockRepo.createUser.mockResolvedValue(savedUser)

        const result = await userService.createUser(input)

        expect(mockRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({
            email: input.email,
        }))
        expect(mockLogProducer.sendUserLogEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'user.log.created',
                actor: input.email,
                targetUser: savedUser,
            })
        )
        expect(result).toEqual(savedUser)
    })

    it('should update a user and log event', async () => {
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
        mockRepo.update.mockResolvedValue(updatedUser)

        await userService.updateUser(1, { name: 'after', email: 'admin@example.com' })

        expect(mockRepo.findById).toHaveBeenCalledWith(1)
        expect(mockRepo.update).toHaveBeenCalledWith(1, { name: 'after', email: 'admin@example.com' })
        expect(mockLogProducer.sendUserLogEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'user.log.updated',
                actor: 'admin@example.com',
                changes: { name: { before: 'before', after: 'after' } },
            })
        )
    })

    it('should delete a user and publish event', async () => {
        const toDelete: User = {
            id: 1,
            name: 'delete',
            email: 'delete@example.com',
            password: 'hashed',
            group: 'test',
            role: 'USER',
            createdAt: new Date(),
        }

        mockRepo.delete.mockResolvedValue(toDelete)

        await userService.deleteUser(1)

        expect(mockRepo.delete).toHaveBeenCalledWith(1)
        expect(mockLogProducer.sendUserLogEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'user.log.deleted',
                actor: 'delete@example.com',
            })
        )
    })

    it('should throw error if user not found on update', async () => {
        mockRepo.findById.mockResolvedValue(null)

        await expect(userService.updateUser(1, { name: 'X' }))
            .rejects
            .toThrow('User not found')
    })
})
