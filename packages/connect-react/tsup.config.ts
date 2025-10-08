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
    'react',
    '@klever/connect',
    '@klever/connect-core',
    '@klever/connect-provider',
    '@klever/connect-wallet',
    '@klever/connect-contracts',
    '@klever/connect-transactions',
    '@klever/connect-crypto',
    '@klever/connect-encoding',
  ],
})
