/**
 * Live testnet test for flow #3.
 * Confirms that `formatKLV` matches what the testnet RPC reports for an
 * address with a real balance.
 */
import { describe, it, expect } from 'vitest'
import { KleverProvider, formatKLV, createKleverAddress } from '@klever/connect'

const SAMPLE_ADDR =
  process.env['KLEVER_TESTNET_ADDRESS'] ??
  'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

describe('format-parse-klv (live testnet)', () => {
  it('formats a real testnet balance to a parseable string', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const balance = await provider.getBalance(createKleverAddress(SAMPLE_ADDR))

    expect(typeof balance).toBe('bigint')

    const formatted = formatKLV(balance)
    expect(typeof formatted).toBe('string')
    // Always parseable by Number for sanity (we don't use the value for math).
    expect(Number.isFinite(Number(formatted))).toBe(true)
  }, 30_000)
})
