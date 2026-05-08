/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite + Vitest config for the delegate-to-validator example.
// - Dev server: localhost:5173 (default).
// - Vitest runs in jsdom so RTL can mount components without a browser.
// - setupFiles registers @testing-library/jest-dom matchers.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
  },
})