/**
 * Mocked tests for flow #2 (address-validation).
 *
 * The SDK validators are pure functions, so no provider mocking is needed.
 */

import { describe, it, expect } from 'vitest'
import { isKleverAddress, isValidAddress, createKleverAddress } from '@klever/connect'

const VALID = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

describe('address-validation', () => {
  describe('isKleverAddress (regex)', () => {
    it('accepts a well-formed klv1 address', () => {
      expect(isKleverAddress(VALID)).toBe(true)
    })

    it('rejects garbage', () => {
      expect(isKleverAddress('not-an-address')).toBe(false)
      expect(isKleverAddress('')).toBe(false)
      expect(isKleverAddress('klv1')).toBe(false)
    })

    it('rejects wrong-prefix bech32', () => {
      // Replace klv1 with bc1 — should fail prefix check.
      const wrongPrefix = VALID.replace(/^klv1/, 'bc1')
      expect(isKleverAddress(wrongPrefix)).toBe(false)
    })
  })

  describe('isValidAddress (bech32 + checksum)', () => {
    it('accepts a well-formed checksummed address', () => {
      expect(isValidAddress(VALID)).toBe(true)
    })

    it('rejects an address with a bad checksum', () => {
      // Mutate the last 6 chars (the checksum portion of a bech32 string).
      const badChecksum = VALID.slice(0, -6) + 'aaaaaa'
      expect(isValidAddress(badChecksum)).toBe(false)
    })
  })

  describe('createKleverAddress', () => {
    it('brands a valid address', () => {
      const branded = createKleverAddress(VALID)
      // The branded type is a string at runtime.
      expect(typeof branded).toBe('string')
      expect(branded).toBe(VALID)
    })

    it('throws on a bad address', () => {
      expect(() => createKleverAddress('not-an-address')).toThrow()
    })
  })
})
