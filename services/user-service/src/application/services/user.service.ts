// services/user-service/src/application/services/user.service.ts

import { UserRepository } from '../ports/user.repository'
import { hashPassword } from '../../shared/utils/password'
import { User } from '../../domain/user.entity'
import { 
  publishUserCreated,
  publishUserDeleted, 
  publishUserUpdated 
} from '../events/user.producer'
import { GetTimestampNow } from '../../shared/utils/time'
import { LogProducerPort } from '../ports/log.producer'
import { getDiff } from '../../shared/utils/getdiff'

export class UserService {
  constructor(
    private repo: UserRepository,
    private logProducer: LogProducerPort
  ) { }

  async createUser(user: Partial<User>): Promise<User> {
    if (!user.name || !user.email || !user.role || !user.group || !user.password) {
      throw new Error('Missing required user fields')
    }

    const hashed = await hashPassword(user.password)

    const data = {
      name: user.name,
      email: user.email,
      role: user.role,
      group: user.group,
      password: hashed,
    }

    const createdUser = await this.repo.createUser(data)
    await publishUserCreated(createdUser)

    await this.logProducer.sendUserLogEvent({
      eventType: 'user.log.created',
      actor: user.email || 'system', // คุณสามารถใช้ req.user.email แทน หากมี context
      targetUser: createdUser,
      timestamp: GetTimestampNow()
    })

    return createdUser
  }
  async listUsers() {
    return this.repo.listUsers()
  }

  async getUser(id: number) {
    return this.repo.findById(id)
  }

  async updateUser(id: number, user: Partial<User>) {
    const before = await this.repo.findById(id) 
    if (!before) throw new Error('User not found')
      
    const updateUser = await this.repo.update(id, user)
    await publishUserUpdated(updateUser)

    await this.logProducer.sendUserLogEvent({
      eventType: 'user.log.updated',
      actor: user.email || 'system', 
      targetUser: updateUser,
      changes: getDiff(before, updateUser),
      timestamp: GetTimestampNow()
    })
  }

  async deleteUser(id: number) {
    const deleteUser=  await this.repo.delete(id)
    await publishUserDeleted(id)

    await this.logProducer.sendUserLogEvent({
      eventType: 'user.log.deleted',
      actor: deleteUser.email || 'system', // คุณสามารถใช้ req.user.email แทน หากมี context
      targetUser: deleteUser,
      timestamp: GetTimestampNow()
    })
  }
}
