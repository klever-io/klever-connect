import { describe, it, expect } from 'vitest'
import {
  isKleverAddress,
  isValidAddress,
  isValidContractAddress,
  createKleverAddress,
  isTransactionHash,
  createTransactionHash,
  isBlockHash,
  createBlockHash,
  createAssetAmount,
  formatAssetAmount,
  parseAssetAmount,
} from '../types/branded'

describe('Branded Types', () => {
  describe('isKleverAddress', () => {
    it('should validate correct Klever addresses', () => {
      // Valid klv1 address (contract address)
      const validAddress = 'klv1qqqqqqqqqqqqqqqqqqqsyqcyq5rqwzqfpg9scrgwpugpzysnzs2s0e3q98'
      expect(isKleverAddress(validAddress)).toBe(true)

      // Valid klv1 address (regular address)
      const validAddress2 = 'klv1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5z5tpwxqergd3c8g7rusqw75vj2'
      expect(isKleverAddress(validAddress2)).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(isKleverAddress('')).toBe(false)
      expect(isKleverAddress('invalid')).toBe(false)
      expect(isKleverAddress('klv1')).toBe(false) // Too short
      expect(isKleverAddress('klv2' + 'q'.repeat(58))).toBe(false) // Wrong prefix
      expect(isKleverAddress('klv1' + 'Q'.repeat(58))).toBe(false) // Uppercase not allowed
    })

    it('should handle non-string inputs', () => {
      expect(isKleverAddress(null as any)).toBe(false)
      expect(isKleverAddress(undefined as any)).toBe(false)
      expect(isKleverAddress(123 as any)).toBe(false)
    })
  })

  describe('isValidAddress', () => {
    it('should validate correct bech32 addresses', () => {
      // Valid klv1 contract address
      const validAddress = 'klv1qqqqqqqqqqqqqqqqqqqsyqcyq5rqwzqfpg9scrgwpugpzysnzs2s0e3q98'
      expect(isValidAddress(validAddress)).toBe(true)

      // Valid klv1 regular address
      const validAddress2 = 'klv1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5z5tpwxqergd3c8g7rusqw75vj2'
      expect(isValidAddress(validAddress2)).toBe(true)
    })

    it('should reject invalid bech32 addresses', () => {
      expect(isValidAddress('')).toBe(false)
      expect(isValidAddress('invalid')).toBe(false)
      expect(isValidAddress('klv1invalid')).toBe(false)
    })
  })

  describe('isValidContractAddress', () => {
    it('should validate contract addresses with 8 zero bytes + VM version 5,0', () => {
      // Valid contract address: 8 zeros + VM version 5 at byte 8 + 0 at byte 9
      const contractAddress1 = 'klv1qqqqqqqqqqqqqpgqhe7lg537aszyv48xpuhqh2jykx986wnd932qrd2478'
      expect(isValidContractAddress(contractAddress1)).toBe(true)

      // Another valid contract address
      const contractAddress2 = 'klv1qqqqqqqqqqqqqpgqqypqxpq9e0la8m4xymxrthek25r0kv93uwysysdf2c'
      expect(isValidContractAddress(contractAddress2)).toBe(true)
    })

    it('should reject regular addresses that do not start with 8 zero bytes', () => {
      // Regular address that doesn't start with 8 zero bytes
      const regularAddress = 'klv1q8qujd7amzjqglz2mrc8emh5vjqwck7qmapc4la28nwmeqtjsnfq7pemdj'
      expect(isValidContractAddress(regularAddress)).toBe(false)
    })

    it('should reject addresses with 8 zeros but wrong VM version', () => {
      // 8 zeros but VM version is 1 (not 5)
      const invalidVMVersion = 'klv1qqqqqqqqqqqqqqgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqdtr49'
      expect(isValidContractAddress(invalidVMVersion)).toBe(false)
    })

    it('should reject addresses with correct VM version but byte 9 is not 0', () => {
      // 8 zeros, VM version 5, but byte 9 is 1 (not 0)
      const invalidByte9 = 'klv1qqqqqqqqqqqqqpgpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqk39wrg'
      expect(isValidContractAddress(invalidByte9)).toBe(false)
    })

    it('should reject invalid addresses', () => {
      expect(isValidContractAddress('')).toBe(false)
      expect(isValidContractAddress('invalid')).toBe(false)
      expect(isValidContractAddress('klv1invalid')).toBe(false)
    })

    it('should reject addresses with wrong prefix', () => {
      const wrongPrefix = 'eth1qqqqqqqqqqqqqpgqhe7lg537aszyv48xpuhqh2jykx986wnd932qrd2478'
      expect(isValidContractAddress(wrongPrefix)).toBe(false)
    })
  })

  describe('createKleverAddress', () => {
    it('should create a valid KleverAddress', () => {
      const validAddress = 'klv1qqqqqqqqqqqqqqqqqqqsyqcyq5rqwzqfpg9scrgwpugpzysnzs2s0e3q98'
      const address = createKleverAddress(validAddress)
      expect(address).toBe(validAddress)
    })

    it('should throw on invalid address', () => {
      expect(() => createKleverAddress('invalid')).toThrow('Invalid Klever address')
    })
  })

  describe('isTransactionHash', () => {
    it('should validate 64-character hex strings', () => {
      const validHash = 'a'.repeat(64)
      expect(isTransactionHash(validHash)).toBe(true)

      const validHash2 = '1234567890abcdef' + 'f'.repeat(48)
      expect(isTransactionHash(validHash2)).toBe(true)
    })

    it('should accept uppercase hex', () => {
      const validHash = 'A'.repeat(64)
      expect(isTransactionHash(validHash)).toBe(true)
    })

    it('should reject invalid hashes', () => {
      expect(isTransactionHash('')).toBe(false)
      expect(isTransactionHash('a'.repeat(63))).toBe(false) // Too short
      expect(isTransactionHash('a'.repeat(65))).toBe(false) // Too long
      expect(isTransactionHash('g'.repeat(64))).toBe(false) // Invalid hex char
    })
  })

  describe('createTransactionHash', () => {
    it('should create a valid TransactionHash', () => {
      const validHash = 'a'.repeat(64)
      const hash = createTransactionHash(validHash)
      expect(hash).toBe(validHash)
    })

    it('should throw on invalid hash', () => {
      expect(() => createTransactionHash('invalid')).toThrow('Invalid transaction hash')
    })
  })

  describe('isBlockHash', () => {
    it('should validate 64-character lowercase hex strings', () => {
      const validHash = 'a'.repeat(64)
      expect(isBlockHash(validHash)).toBe(true)

      const validHash2 = '1234567890abcdef' + 'f'.repeat(48)
      expect(isBlockHash(validHash2)).toBe(true)
    })

    it('should accept mixed case', () => {
      const validHash = 'A'.repeat(64)
      expect(isBlockHash(validHash)).toBe(true)
    })

    it('should reject invalid hashes', () => {
      expect(isBlockHash('')).toBe(false)
      expect(isBlockHash('a'.repeat(63))).toBe(false)
      expect(isBlockHash('a'.repeat(65))).toBe(false)
      expect(isBlockHash('g'.repeat(64))).toBe(false)
    })
  })

  describe('createBlockHash', () => {
    it('should create a valid BlockHash', () => {
      const validHash = 'a'.repeat(64)
      const hash = createBlockHash(validHash)
      expect(hash).toBe(validHash)
    })

    it('should throw on invalid hash', () => {
      expect(() => createBlockHash('invalid')).toThrow('Invalid block hash')
    })
  })

  describe('createAssetAmount', () => {
    it('should create from bigint', () => {
      const amount = createAssetAmount(1000000n)
      expect(amount).toBe(1000000n)
    })

    it('should create from string', () => {
      const amount = createAssetAmount('1000000')
      expect(amount).toBe(1000000n)
    })

    it('should create from number', () => {
      const amount = createAssetAmount(1000000)
      expect(amount).toBe(1000000n)
    })

    it('should throw on negative amount', () => {
      expect(() => createAssetAmount(-100n)).toThrow('Asset amount cannot be negative')
    })

    it('should accept zero', () => {
      const amount = createAssetAmount(0n)
      expect(amount).toBe(0n)
    })
  })

  describe('formatAssetAmount', () => {
    it('should format whole amounts', () => {
      expect(formatAssetAmount(createAssetAmount(1000000n))).toBe('1')
      expect(formatAssetAmount(createAssetAmount(5000000n))).toBe('5')
    })

    it('should format fractional amounts', () => {
      expect(formatAssetAmount(createAssetAmount(1500000n))).toBe('1.5')
      expect(formatAssetAmount(createAssetAmount(1234567n))).toBe('1.234567')
    })

    it('should remove trailing zeros', () => {
      expect(formatAssetAmount(createAssetAmount(1100000n))).toBe('1.1')
      expect(formatAssetAmount(createAssetAmount(1000001n))).toBe('1.000001')
    })

    it('should handle zero', () => {
      expect(formatAssetAmount(createAssetAmount(0n))).toBe('0')
    })

    it('should handle custom decimals', () => {
      expect(formatAssetAmount(createAssetAmount(1000n), 3)).toBe('1')
      expect(formatAssetAmount(createAssetAmount(1500n), 3)).toBe('1.5')
    })
  })

  describe('parseAssetAmount', () => {
    it('should parse whole numbers', () => {
      expect(parseAssetAmount('1')).toBe(1000000n)
      expect(parseAssetAmount('5')).toBe(5000000n)
    })

    it('should parse fractional numbers', () => {
      expect(parseAssetAmount('1.5')).toBe(1500000n)
      expect(parseAssetAmount('1.234567')).toBe(1234567n)
    })

    it('should handle zero', () => {
      expect(parseAssetAmount('0')).toBe(0n)
      expect(parseAssetAmount('0.0')).toBe(0n)
    })

    it('should handle custom decimals', () => {
      expect(parseAssetAmount('1', 3)).toBe(1000n)
      expect(parseAssetAmount('1.5', 3)).toBe(1500n)
    })

    it('should pad fractional parts', () => {
      expect(parseAssetAmount('1.1')).toBe(1100000n) // 1.100000
      expect(parseAssetAmount('0.000001')).toBe(1n) // Minimum amount
    })

    it('should truncate excessive decimal places', () => {
      expect(parseAssetAmount('1.123456789')).toBe(1123456n) // Only first 6 decimals
    })
  })

  describe('round-trip formatting', () => {
    it('should preserve values through parse and format', () => {
      const testValues = ['1', '1.5', '0.000001', '1234.567890']

      for (const value of testValues) {
        const parsed = parseAssetAmount(value)
        const formatted = formatAssetAmount(parsed)

        // Parse the formatted value again to compare (handles trailing zero removal)
        const reparsed = parseAssetAmount(formatted)
        expect(reparsed).toBe(parsed)
      }
    })
  })
})
