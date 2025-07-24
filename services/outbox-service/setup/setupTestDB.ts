// services/outbox-service/setup/setupTestDB.ts

import { execSync } from 'child_process'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

export async function resetTestDB() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('❌ NEVER run resetTestDB() in production!')
    }
    
    try {
        console.log('📤 Resetting outbox schema...')
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
        console.log('✅ Test DB reset')
    } catch (error) {
        console.error('❌ Failed to reset test DB', error)
        throw error
    }
}
