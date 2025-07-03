// services/user-service/src/presentation/handlers/auth.handler.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { UserService } from '../../application/services/user.service'
import { userRepository } from '../../infrastructure/repositories/user.repository.prisma'
import { LoginInput } from '../../types/auth.types'
import { UserLogProducerService } from '../../application/events/log.producer'
import { comparePassword } from '../../shared/utils/password'
import { validateEmail } from '../../shared/utils/validation'

const logProducer = new UserLogProducerService()
const userService = new UserService(userRepository, logProducer)

export const loginHandler = async (
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
) => {
    try {
        const { email, password } = request.body

        if (!email || !password) {
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Email and password are required'
            })
        }

        if (!validateEmail(email)) {
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid email format'
            })
        }

        const user = await userService.getUserByEmail(email)

        if (!user) {
            request.log.warn(`Login attempt for non-existent email: ${email}`)
            return reply.code(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid email or password'
            })
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            request.log.warn(`Invalid password attempt for user: ${user.id}`)
            return reply.code(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid email or password'
            })
        }

        // 4. ตรวจสอบ JWT_SECRET
        if (!process.env.JWT_SECRET) {
            request.log.error('JWT_SECRET is not configured')
            throw new Error('Server configuration error')
        }

        // 5. สร้าง JWT Token
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role || 'USER'
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })

        // 6. ตอบกลับด้วย token
        return reply.send({
            accessToken: token,
            expiresIn: 3600, // 1 ชั่วโมงในหน่วยวินาที
            tokenType: 'Bearer'
        })

    } catch (error) {
        request.log.error('Login error:', error)
        return reply.code(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        })
    }
}