/**
 * Live testnet test: pulls a real account, walks each asset balance, and
 * confirms formatUnits never throws and round-trips correctly for every
 * precision the live RPC reports.
 */
import { describe, it, expect } from 'vitest'
import { KleverProvider, formatUnits, parseUnits, createKleverAddress } from '@klever/connect'

const SAMPLE = process.env['KLEVER_TESTNET_ADDRESS'] ??
  'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

describe('format-parse-kda (live testnet)', () => {
  it('formats every asset balance with its declared precision', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const account = await provider.getAccount(createKleverAddress(SAMPLE))

    expect(account).toBeDefined()
    const assets = account.assets ?? []

    for (const asset of assets) {
      // `precision` is included in the IAssetBalance shape; balance is stored as
      // a string of smallest units.
      const prec = (asset as { precision: number }).precision
      const balance = BigInt((asset as { balance: string }).balance)

      // Should never throw.
      const human = formatUnits(balance, prec)
      // Round-trip via parseUnits — no precision drift.
      expect(parseUnits(human, prec)).toBe(balance)
    }
  }, 30_000)
})
