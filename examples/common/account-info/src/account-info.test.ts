import { describe, it, expect, vi } from 'vitest'

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')

  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async getAccount(_address: string) {
      return {
        address: _address,
        nonce: 7,
        balance: '12345678',
        assets: [
          { assetId: 'KLV', balance: '12345678', precision: 6, frozenBalance: '0' },
          { assetId: 'MTT-ABCD-1A', balance: '500', precision: 0, frozenBalance: '0' },
        ],
        permissions: [],
      }
    }
  }

  return { ...actual, KleverProvider: MockProvider }
})

import { KleverProvider, formatKLV, createKleverAddress } from '@klever/connect'

describe('account-info (mocked)', () => {
  it('returns the canned account fields', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const addr = createKleverAddress(
      'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
    )
    const account = await provider.getAccount(addr)

    expect(account.nonce).toBe(7)
    expect(formatKLV(BigInt(account.balance))).toBe('12.345678')
    expect(account.assets).toHaveLength(2)
  })
})
