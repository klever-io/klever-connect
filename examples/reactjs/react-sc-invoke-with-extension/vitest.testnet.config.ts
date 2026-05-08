/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Live-network variant: only runs files matching `*.testnet.test.tsx`.
// Run via `npm run test:testnet`. NOT included in CI.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['**/*.testnet.test.tsx'],
    testTimeout: 60_000,
  },
})
