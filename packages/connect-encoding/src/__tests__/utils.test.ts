import { describe, it, expect } from 'vitest'
import { encodeHex, hashBlake2b } from '../utils'

describe('utils', () => {
  describe('encodeHex', () => {
    it('should encode string to hex with 0x prefix', () => {
      const result = encodeHex('Hello')
      expect(result).toBe('0x48656c6c6f')
    })

    it('should encode empty string', () => {
      const result = encodeHex('')
      expect(result).toBe('0x')
    })

    it('should encode ASCII characters', () => {
      const result = encodeHex('ABC')
      expect(result).toBe('0x414243')
    })

    it('should always start with 0x prefix', () => {
      expect(encodeHex('test')).toMatch(/^0x/)
    })

    it('should encode function signature format', () => {
      const result = encodeHex('transfer')
      expect(result).toBe('0x7472616e73666572')
    })
  })

  describe('hashBlake2b', () => {
    it('should produce 32 byte hash by default', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const hash = hashBlake2b(data)
      expect(hash.length).toBe(32)
    })

    it('should produce hash of custom length', () => {
      const data = new Uint8Array([1, 2, 3])
      const hash = hashBlake2b(data, 16)
      expect(hash.length).toBe(16)
    })

    it('should produce a Uint8Array', () => {
      const hash = hashBlake2b(new Uint8Array([1, 2, 3]))
      expect(hash).toBeInstanceOf(Uint8Array)
    })

    it('should produce deterministic hashes for same input', () => {
      const data = new Uint8Array([10, 20, 30])
      const hash1 = hashBlake2b(data)
      const hash2 = hashBlake2b(data)
      expect(hash1).toEqual(hash2)
    })

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashBlake2b(new Uint8Array([1]))
      const hash2 = hashBlake2b(new Uint8Array([2]))
      expect(hash1).not.toEqual(hash2)
    })

    it('should hash empty input', () => {
      const hash = hashBlake2b(new Uint8Array())
      expect(hash.length).toBe(32)
    })

    it('should produce 64-byte hash when requested', () => {
      const hash = hashBlake2b(new Uint8Array([1, 2, 3]), 64)
      expect(hash.length).toBe(64)
    })
  })
})
