/**
 * Live testnet test for flow #2.
 *
 * Validates that an address that passes the strict check actually works
 * against the live testnet RPC (i.e., the SDK validation matches what the
 * node accepts).
 */

import { describe, it, expect } from 'vitest'
import { KleverProvider, createKleverAddress, isValidAddress } from '@klever/connect'

const VALID = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

describe('address-validation (live testnet)', () => {
  it('a strictly-valid address is accepted by the testnet RPC', async () => {
    expect(isValidAddress(VALID)).toBe(true)

    const provider = new KleverProvider({ network: 'testnet' })
    const address = createKleverAddress(VALID)

    // Should not throw on a well-formed address.
    const balance = await provider.getBalance(address)
    expect(typeof balance).toBe('bigint')
  }, 30_000)
})
