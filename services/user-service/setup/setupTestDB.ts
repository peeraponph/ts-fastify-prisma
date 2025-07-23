// services/user-service/setup/setupTestDB.ts

import { execSync } from 'child_process'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

export async function resetTestDB() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('❌ NEVER run resetTestDB() in production!')
    }

    console.log('🔄 Resetting test databases...')

    try {
        console.log('📦 Resetting user schema...')
        execSync(
            `npx prisma db push --schema=./prisma/schema.prisma --force-reset --skip-generate`,
            {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    NODE_ENV: 'test',
                    DATABASE_URL: process.env.DATABASE_URL,
                },
            }
        )

        console.log('📤 Resetting outbox schema...')
        execSync(
            `npx prisma db push --schema=./prisma/outbox.prisma --force-reset --skip-generate`,
            {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    NODE_ENV: 'test',
                    DATABASE_URL: process.env.DATABASE_URL_OUTBOX,
                },
            }
        )
    } catch (error) {
        console.error('❌ Failed to reset test DB', error)
        throw error
    }
}
