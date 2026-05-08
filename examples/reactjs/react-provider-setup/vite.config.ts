/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite + Vitest config for the react-provider-setup example.
// - The dev server is the default vite host (localhost:5173).
// - Vitest runs in jsdom so RTL can mount components without a browser.
// - `setupFiles` wires up @testing-library/jest-dom matchers (toBeInTheDocument, etc).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
  },
})
