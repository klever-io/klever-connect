/**
 * Mocked-provider tests for flow #11.
 * We mock @klever/connect's KleverProvider so the test runs offline.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted so vi.mock factory can read it.
const mockedBalances = vi.hoisted(() => new Map<string, bigint>())

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')

  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async getBalance(address: string, asset = 'KLV') {
      return mockedBalances.get(`${address}::${asset}`) ?? 0n
    }
  }

  return {
    ...actual,
    KleverProvider: MockProvider,
  }
})

import { KleverProvider, formatKLV, createKleverAddress } from '@klever/connect'

describe('balance-read (mocked)', () => {
  const ADDR = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

  beforeEach(() => {
    mockedBalances.clear()
  })

  it('fetches a KLV balance via the provider', async () => {
    mockedBalances.set(`${ADDR}::KLV`, 12_345_678n)

    const provider = new KleverProvider({ network: 'testnet' })
    const balance = await provider.getBalance(createKleverAddress(ADDR))

    expect(balance).toBe(12_345_678n)
    expect(formatKLV(balance)).toBe('12.345678')
  })

  it('returns 0n for an address with no balance', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const balance = await provider.getBalance(createKleverAddress(ADDR))
    expect(balance).toBe(0n)
  })

  it('fetches a KDA balance with the assetId argument', async () => {
    mockedBalances.set(`${ADDR}::MTT-ABCD-1A`, 100n)
    const provider = new KleverProvider({ network: 'testnet' })

    const klv = await provider.getBalance(createKleverAddress(ADDR))
    const kda = await provider.getBalance(createKleverAddress(ADDR), 'MTT-ABCD-1A')

    expect(klv).toBe(0n)
    expect(kda).toBe(100n)
  })
})
