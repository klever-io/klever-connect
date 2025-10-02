import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  esbuildOptions(options) {
    // Suppress eval warning from protobuf.js - it's safe in this context
    options.legalComments = 'none'
  },
})
