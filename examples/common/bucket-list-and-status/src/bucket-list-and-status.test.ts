import { describe, it, expect, vi } from 'vitest'

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')

  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async getAccount(addr: string) {
      return {
        address: addr,
        nonce: 0,
        balance: '0',
        assets: [
          {
            assetId: 'KLV',
            balance: '1000000000',
            frozenBalance: '500000000',
            unfrozenBalance: '0',
            precision: 6,
            buckets: [
              {
                id: 'bucket-0',
                balance: '500000000',
                stakeAt: 100,
                unstakedEpoch: 0,
                validator: 'klv1validator...',
              },
            ],
          },
        ],
        permissions: [],
      }
    }
  }
  return { ...actual, KleverProvider: MockProvider }
})

import { KleverProvider, createKleverAddress, formatKLV } from '@klever/connect'

describe('bucket-list-and-status (mocked)', () => {
  it('renders the canned bucket list', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const address = createKleverAddress(
      'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
    )
    const acc = await provider.getAccount(address)
    const klv = acc.assets!.find((a) => (a as { assetId: string }).assetId === 'KLV')!
    const buckets = (klv as { buckets: Array<{ balance: string }> }).buckets

    expect(buckets).toHaveLength(1)
    expect(formatKLV(BigInt(buckets[0]!.balance))).toBe('500')
  })
})
