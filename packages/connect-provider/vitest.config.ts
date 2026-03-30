import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@klever/connect-core': resolve(__dirname, '../connect-core/src'),
      '@klever/connect-crypto': resolve(__dirname, '../connect-crypto/src'),
      '@klever/connect-encoding': resolve(__dirname, '../connect-encoding/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.testnet.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.bench.ts',
        '**/*.d.ts',
        '**/*.testnet.ts',
        '**/tsup.config.ts',
        '**/vitest.config.ts',
        '**/vitest.integration.config.ts',
        '**/types/**',
        '**/types.ts',
        '**/index.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
})
