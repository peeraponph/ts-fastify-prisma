//  services/user-service/src/domain/user.entity.ts
import { Role } from '../generated/prisma'

export interface User {
    id: number
    name: string
    email: string
    password: string
    role: Role
    group: string
    createdAt: Date
}

export interface UserWithoutPassword {
    id: number
    name: string
    email: string
    role: Role
    group: string
    createdAt: Date
}