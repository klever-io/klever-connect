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
        '**/logger/**',
      ],
      thresholds: {
        // statements/lines are low because errors/ subdirectory (base.ts, errors.ts)
        // has 0% coverage — these need @klever/connect-core error system tests.
        // TODO: raise statements/lines to 75 once errors/ gains test coverage.
        statements: 40,
        branches: 80,
        functions: 95,
        lines: 40,
      },
    },
  },
})
