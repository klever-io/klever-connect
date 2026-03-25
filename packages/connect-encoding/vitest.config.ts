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
        '**/scripts/**',
        '**/proto/**',
        '**/proto.ts',
        '**/abi.ts',
        '**/index.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
})
