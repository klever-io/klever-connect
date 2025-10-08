import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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
