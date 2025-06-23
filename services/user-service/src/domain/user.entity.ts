//  services/user-service/src/domain/user.entity.ts
import { Role } from '../generated/prisma'

export interface User {
    id: number
    email: string
    password: string
    name: string
    group: string
    role: Role
}
