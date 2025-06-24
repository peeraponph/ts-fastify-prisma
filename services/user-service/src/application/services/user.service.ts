// services/user-service/src/application/services/user.service.ts

import { UserRepository } from '../ports/user.repository'
import { hashPassword } from '../../shared/utils/password'
import { User } from '../../domain/user.entity'
import { 
  publishUserCreated,
  publishUserDeleted, 
  publishUserUpdated 
} from '../events/user.producer'

export class UserService {
  constructor(private repo: UserRepository) { }

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

    return createdUser
  }
  async listUsers() {
    return this.repo.listUsers()
  }

  async getUser(id: number) {
    return this.repo.findById(id)
  }

  async updateUser(id: number, user: Partial<User>) {
    const updateUser = await this.repo.update(id, user)
    await publishUserUpdated(updateUser)
  }

  async deleteUser(id: number) {
    const deleteUser=  await this.repo.delete(id)
    await publishUserDeleted(id)
    return deleteUser
  }
}
