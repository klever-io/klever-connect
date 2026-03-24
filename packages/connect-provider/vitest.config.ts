import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

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
      reporter: ['text', 'json', 'html'],
    },
  },
})
