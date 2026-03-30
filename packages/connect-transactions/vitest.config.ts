import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
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
        '**/index.ts',
        '**/constants.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 75,
        functions: 55,
        lines: 60,
      },
    },
    // Exclude testnet integration tests by default
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.testnet.ts'],
    // Multi-project setup (replaces vitest.workspace.ts)
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['**/*.{test,spec}.ts'],
          exclude: ['**/node_modules/**', '**/dist/**', '**/*.testnet.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          globals: true,
          environment: 'node',
          include: ['**/*.testnet.ts'],
          exclude: ['**/node_modules/**', '**/dist/**'],
        },
      },
    ],
  },
})
