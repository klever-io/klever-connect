import { describe, it, expect } from 'vitest'
import { KleverProvider } from '@klever/connect'

const SHOULD_RUN = (process.env['KLV_LIVE_TESTS'] ?? 'false') === 'true'

describe.skipIf(!SHOULD_RUN)('block-monitor (testnet)', () => {
  it('reads the current block number', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const head = await provider.getBlockNumber()
    expect(head).toBeGreaterThan(0)
  }, 30_000)
})
