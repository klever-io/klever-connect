import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/connect-core/vitest.config.ts',
  'packages/connect-crypto/vitest.config.ts',
  'packages/connect-encoding/vitest.config.ts',
  'packages/connect-provider/vitest.config.ts',
  'packages/connect-transactions/vitest.config.ts',
  'packages/connect-wallet/vitest.config.ts',
  'packages/connect-contracts/vitest.config.ts',
  'packages/connect-react/vitest.config.ts',
  'packages/connect/vitest.config.ts',
])
