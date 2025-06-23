import { User } from '../domain/user.entity'
import { z } from 'zod'

export interface UserRepository {
    create(data: { name: string; email: string }): Promise<User>
    findAll(): Promise<User[]>
}
