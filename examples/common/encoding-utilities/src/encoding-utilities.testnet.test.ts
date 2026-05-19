/**
 * No live testnet logic is needed for pure-encoding helpers. We keep an empty
 * suite so the script `npm run test:testnet` exits cleanly across all
 * common examples.
 */
import { describe, it, expect } from 'vitest'
import { bech32Decode } from '@klever/connect-encoding'

describe('encoding-utilities (live)', () => {
  it('bech32-decodes a real Klever testnet address', () => {
    const addr = process.env['KLEVER_TESTNET_ADDRESS'] ??
      'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
    const { data, prefix } = bech32Decode(addr)
    expect(prefix).toBe('klv')
    expect(data.length).toBe(32)
  })
})
