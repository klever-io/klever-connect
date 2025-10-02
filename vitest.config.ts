import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.testnet.ts'],
  },
  resolve: {
    alias: {
      '@klever/connect-core': new URL('./packages/connect-core/src/index.ts', import.meta.url)
        .pathname,
      '@klever/connect-crypto': new URL('./packages/connect-crypto/src/index.ts', import.meta.url)
        .pathname,
      '@klever/connect-encoding': new URL(
        './packages/connect-encoding/src/index.ts',
        import.meta.url,
      ).pathname,
      '@klever/connect-provider': new URL(
        './packages/connect-provider/src/index.ts',
        import.meta.url,
      ).pathname,
      '@klever/connect-transactions': new URL(
        './packages/connect-transactions/src/index.ts',
        import.meta.url,
      ).pathname,
      '@klever/connect-contracts': new URL(
        './packages/connect-contracts/src/index.ts',
        import.meta.url,
      ).pathname,
      '@klever/connect-wallet': new URL('./packages/connect-wallet/src/index.ts', import.meta.url)
        .pathname,
      '@klever/connect-react': new URL('./packages/connect-react/src/index.ts', import.meta.url)
        .pathname,
      '@klever/connect': new URL('./packages/connect/src/index.ts', import.meta.url).pathname,
    },
  },
})
