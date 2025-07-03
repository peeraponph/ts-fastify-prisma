// services/user-service/src/application/services/user.service.ts
import { UserRepository, ListUsersOptions, PaginatedResult } from '../ports/user.repository'
import { LogProducerPort } from '../ports/log.producer'
import { hashPassword } from '../../shared/utils/password'
import { User } from '../../domain/user.entity'
import {
  publishUserCreated,
  publishUserDeleted,
  publishUserUpdated
} from '../events/user.producer'
import { GetTimestampNow } from '../../shared/utils/time'
import { getDiff } from '../../shared/utils/getdiff'
import { CreateUserInput, UpdateUserInput } from '../../types/user.types'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logProducer: LogProducerPort
  ) { }

  async createUser(userData: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await hashPassword(userData.password)

    const data = {
      ...userData,
      password: hashedPassword,
    }

    const createdUser = await this.userRepository.createUser(data)

    // Publish events
    await Promise.all([
      publishUserCreated(createdUser),
      this.logProducer.sendUserLogEvent({
        eventType: 'user.log.created',
        actor: 'system',
        targetUser: createdUser,
        timestamp: GetTimestampNow()
      })
    ])

    return createdUser
  }

  async listUsers(options: ListUsersOptions = {}): Promise<PaginatedResult<User>> {
    return await this.userRepository.listUsers(options)
  }

  async getUser(id: number): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email)
  }

  async updateUser(id: number, userData: UpdateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(userData.email)
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email already in use by another user')
      }
    }

    const updatedUser = await this.userRepository.update(id, userData)

    // Publish events
    await Promise.all([
      publishUserUpdated(updatedUser),
      this.logProducer.sendUserLogEvent({
        eventType: 'user.log.updated',
        actor: 'system',
        targetUser: updatedUser,
        changes: getDiff(existingUser, updatedUser),
        timestamp: GetTimestampNow()
      })
    ])

    return updatedUser
  }

  async deleteUser(id: number): Promise<void> {
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    await this.userRepository.delete(id)

    // Publish events
    await Promise.all([
      publishUserDeleted(id),
      this.logProducer.sendUserLogEvent({
        eventType: 'user.log.deleted',
        actor: 'system',
        targetUser: existingUser,
        timestamp: GetTimestampNow()
      })
    ])
  }
}