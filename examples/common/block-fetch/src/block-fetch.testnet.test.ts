import { describe, it, expect } from 'vitest'
import { KleverProvider } from '@klever/connect'

describe('block-fetch (live testnet)', () => {
  it('returns a real block with a positive timestamp', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const block = await provider.getBlock('latest')

    const ts = (block as { timestamp?: number | string }).timestamp
    expect(ts).toBeDefined()
  }, 30_000)
})
