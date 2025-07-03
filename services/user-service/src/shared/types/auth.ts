// services/user-service/src/shared/types/auth.ts
export interface UserPayload {
    id: string
    email: string
    role: 'ADMIN' | 'USER'
}