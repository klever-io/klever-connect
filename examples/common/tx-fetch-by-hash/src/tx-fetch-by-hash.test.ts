import { describe, it, expect, vi } from 'vitest'

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')

  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async getTransaction(hash: string) {
      return {
        hash,
        blockNum: 1234,
        status: 'success',
        sender: 'klv1sender...',
        contractType: 0,
        fee: '0.001',
      }
    }
    async getTransactionReceipt(_hash: string) {
      return { logs: [{ topic: 'transfer' }], receipts: [{ type: 0 }] }
    }
    getTransactionUrl(hash: string) {
      return `https://testnet.klever.finance/transaction/${hash}`
    }
  }

  return { ...actual, KleverProvider: MockProvider }
})

import { KleverProvider, createTransactionHash } from '@klever/connect'

const HASH = 'a'.repeat(64)

describe('tx-fetch-by-hash (mocked)', () => {
  it('fetches tx + receipt + url', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const hash = createTransactionHash(HASH)

    const tx = await provider.getTransaction(hash)
    expect((tx as { blockNum: number }).blockNum).toBe(1234)

    const receipt = await provider.getTransactionReceipt(hash)
    expect((receipt as { logs: unknown[] }).logs).toHaveLength(1)

    const url = provider.getTransactionUrl(hash)
    expect(url).toContain(HASH)
  })
})
