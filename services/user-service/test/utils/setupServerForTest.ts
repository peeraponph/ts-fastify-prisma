// services/user-service/test/utils/setupServerForTest.ts

import Fastify from 'fastify'
import authPlugin from '../../src/infrastructure/auth/auth.plugin'
import userRoutes from '../../src/presentation/routes/user.route'
import authRoutes from '../../src/presentation/routes/auth.route'
import healthRoute from '../../src/presentation/routes/health.route'

export async function setupServerForTest() {
    const app = Fastify({ logger: false })

    await app.register(authPlugin)
    await app.register(userRoutes, { prefix: '/api/v1/users' })
    await app.register(authRoutes, { prefix: '/auth' })
    await app.register(healthRoute, { prefix: '/api/v1' })

    await app.ready()
    return app
}
