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
        '**/tsup.config.ts',
        '**/vitest.config.ts',
        '**/types/**',
        '**/types.ts',
        '**/index.ts',
        '**/env.d.ts',
        '**/constants.ts',
        '**/errors/base.ts',
        '**/errors/constants.ts',
        '**/errors/errors.ts',
        '**/logger/**',
      ],
      thresholds: {
        statements: 75,
        branches: 60,
        functions: 75,
        lines: 75,
      },
    },
  },
})
