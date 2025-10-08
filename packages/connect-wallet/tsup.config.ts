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
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.js' : '.mjs',
  }),
  external: [
    '@klever/connect-core',
    '@klever/connect-crypto',
    '@klever/connect-provider',
    '@klever/connect-transactions',
    '@klever/connect-encoding',
  ],
})
