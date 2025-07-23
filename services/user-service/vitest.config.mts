// services/user-service/vitest.config.ts

// import '../setup/setupTestEnv'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['./setup/setupTestEnv.ts'],
    },
})