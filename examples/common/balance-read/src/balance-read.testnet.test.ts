/**
 * Live testnet test: fetch a real testnet balance and confirm it returns a
 * non-negative bigint.
 */
import { describe, it, expect } from 'vitest'
import { KleverProvider, createKleverAddress } from '@klever/connect'

const SAMPLE = process.env['KLEVER_TESTNET_ADDRESS'] ??
  'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

describe('balance-read (live testnet)', () => {
  it('returns a bigint balance for a known testnet address', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const balance = await provider.getBalance(createKleverAddress(SAMPLE))

    expect(typeof balance).toBe('bigint')
    expect(balance >= 0n).toBe(true)
  }, 30_000)
})
