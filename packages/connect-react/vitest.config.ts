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
        '**/types.ts',
        '**/global.d.ts',
        '**/index.ts',
      ],
      thresholds: {
        // Low thresholds reflect that context.tsx and hooks/** are measured but untested
        // TODO: raise thresholds once hook tests are implemented.
        statements: 7,
        branches: 70,
        functions: 75,
        lines: 7,
      },
    },
  },
})
