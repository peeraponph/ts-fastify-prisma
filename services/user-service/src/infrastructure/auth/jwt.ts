// services/user-service/src/infrastructure/auth/jwt.ts
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserPayload } from '../../shared/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'chang-default-key'

export function signToken(payload: UserPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export function verifyToken(token: string): UserPayload {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (typeof decoded === 'string') {
        throw new Error('Invalid token format')
    }

    return decoded as UserPayload
}
