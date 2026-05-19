/**
 * Live testnet test for flow #1 (provider-network-setup).
 *
 * Excluded from CI per the repo policy in CLAUDE.md (`*.testnet.test.ts`).
 * Run manually:
 *   npm run test:testnet
 *
 * Asserts that a real testnet provider returns a real block height.
 */

import { describe, it, expect } from 'vitest'
import { KleverProvider } from '@klever/connect'

describe('provider-network-setup (live testnet)', () => {
  it('reaches the live testnet RPC and reports a block number > 0', async () => {
    const provider = new KleverProvider({ network: 'testnet' })

    const block = await provider.getBlockNumber()
    expect(typeof block).toBe('number')
    expect(block).toBeGreaterThan(0)
  }, 30_000)
})
