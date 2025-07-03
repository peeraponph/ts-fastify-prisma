// services/user-service/src/types/auth.types.ts
import { z } from 'zod'

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4)
})

export type LoginInput = z.infer<typeof LoginSchema>