// services/user-service/src/application/services/user.service.ts
import { UserRepository, ListUsersOptions, PaginatedResult } from '../ports/user.repository'
import { LogProducerPort } from '../ports/log.producer'
import { hashPassword } from '../../shared/utils/password'
import { User } from '../../domain/user.entity'
import { writeOutboxEvent } from './outbox.service'
import { GetTimestampNow } from '../../shared/utils/time'
import { CreateUserInput, UpdateUserInput } from '../../types/user.types'
import { KafkaUserTopic } from '../../infrastructure/kafka/topic'
import { context, trace, propagation } from '@opentelemetry/api'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logProducer: LogProducerPort
  ) { }

  async createUser(userData: CreateUserInput): Promise<User> {
    const tracer = trace.getTracer('user-service')
    return await context.with(trace.setSpan(context.active(), tracer.startSpan('user.createUser')), async () => {

      try {
        const existingUser = await this.userRepository.findByEmail(userData.email)
        if (existingUser) throw new Error('User already exists')

        const hashedPassword = await hashPassword(userData.password)
        const createdUser = await this.userRepository.createUser({ ...userData, password: hashedPassword })

        // 👉 inject trace context into custom carrier (headers-like object)
        const carrier: Record<string, string> = {}
        propagation.inject(context.active(), carrier)

        await Promise.all([
          writeOutboxEvent({
            topic: KafkaUserTopic.USER_CREATED,
            key: createdUser.id.toString(),
            eventType: KafkaUserTopic.USER_CREATED,
            payload: {
              id: createdUser.id,
              email: createdUser.email,
              name: createdUser.name,
              role: createdUser.role,
              group: createdUser.group,
            },
            headers: carrier, // 🔥 include trace context
          }),
          this.logProducer.sendUserLogEvent({
            eventType: 'user.log.created',
            actor: 'system',
            targetUser: createdUser,
            timestamp: GetTimestampNow()
          })
        ])
        return createdUser

      } catch (err) {

        throw err

      } finally {
      }
    })
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
    const span = trace.getTracer('user-service').startSpan('user.updateUser')
    return await context.with(trace.setSpan(context.active(), span), async () => {
      const existingUser = await this.userRepository.findById(id)
      if (!existingUser) throw new Error('User not found')

      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(userData.email)
        if (userWithEmail && userWithEmail.id !== id) throw new Error('Email already in use')
      }

      const updatedUser = await this.userRepository.update(id, userData)

      await writeOutboxEvent({
        topic: KafkaUserTopic.USER_UPDATED,
        key: updatedUser.id.toString(),
        eventType: KafkaUserTopic.USER_UPDATED,
        payload: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          group: updatedUser.group,
        },
      })

      span.end()
      return updatedUser
    })
  }

  async deleteUser(id: number): Promise<void> {
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    await this.userRepository.delete(id)

    // Publish events
    await Promise.all([
      writeOutboxEvent({
        topic: KafkaUserTopic.USER_DELETED,
        key: existingUser.id.toString(),
        eventType: KafkaUserTopic.USER_DELETED,
        payload: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          group: existingUser.group,
        },
      }),
      this.logProducer.sendUserLogEvent({
        eventType: 'user.log.deleted',
        actor: 'system',
        targetUser: existingUser,
        timestamp: GetTimestampNow()
      })
    ])
  }
}