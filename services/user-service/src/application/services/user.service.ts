// services/user-service/src/application/services/user.service.ts

import { UserRepository } from '../ports/user.repository'
import { hashPassword } from '../../shared/utils/password'
import { User } from '../../domain/user.entity'

export class UserService {
  constructor(private repo: UserRepository) { }

  async createUser(user: Partial<User>) {
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

    return this.repo.createUser(data)
  }
  async listUsers() {
    return this.repo.listUsers()
  }

  async getUser(id: number) {
    return this.repo.findById(id)
  }

  async updateUser(id: number, user: Partial<User>) {
    return this.repo.update(id, user)
  }

  async deleteUser(id: number) {
    return this.repo.delete(id)
  }
}
