import { User } from '../domain/user.entity'

export interface UserRepository {
    create(data: { name: string; email: string }): Promise<User>
    findAll(): Promise<User[]>
}
