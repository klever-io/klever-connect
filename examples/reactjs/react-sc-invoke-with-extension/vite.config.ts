/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standard Vite + React 19 config used by every example folder in `examples/reactjs/`.
// The vitest block enables jsdom + RTL globals so the default `*.test.tsx`
// suite can mount React components without a browser.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // The live testnet variant lives behind its own config (`vitest.testnet.config.ts`)
    // and is excluded from the default run so CI never hits the network.
    exclude: ['**/node_modules/**', '**/*.testnet.test.tsx'],
  },
})
