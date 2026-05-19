import { describe, it, expect, vi } from 'vitest'

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')
  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async getBlockNumber() { return 12345 }
    async getBlock(id: number | 'latest') {
      return {
        blockNum: id === 'latest' ? 12345 : id,
        hash: '0xabc',
        timestamp: 1714400000,
        transactions: [{ hash: '0xtxhash1', sender: 'klv1send1', contractType: 0 }],
      }
    }
  }
  return { ...actual, KleverProvider: MockProvider }
})

import { KleverProvider } from '@klever/connect'

describe('block-fetch (mocked)', () => {
  it('fetches the latest block height', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    expect(await provider.getBlockNumber()).toBe(12345)
  })

  it('getBlock("latest") returns the canned latest', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const block = await provider.getBlock('latest')
    expect((block as { blockNum: number }).blockNum).toBe(12345)
  })

  it('getBlock(N) returns the block for that height', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const block = await provider.getBlock(42)
    expect((block as { blockNum: number }).blockNum).toBe(42)
  })
})
