import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Unit tests (fast, no network)
  {
    test: {
      name: 'unit',
      globals: true,
      environment: 'node',
      include: ['**/*.{test,spec}.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.testnet.ts'],
    },
  },
  // Integration tests (slow, requires network)
  {
    test: {
      name: 'integration',
      globals: true,
      environment: 'node',
      include: ['**/*.testnet.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
])
