// services/user-service/setup/setupTestEnv.ts

import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.test before running tests
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

console.log('✅ Loaded .env.test: ', process.env.DATABASE_URL)
