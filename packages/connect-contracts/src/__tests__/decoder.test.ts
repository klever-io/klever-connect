/**
 * Tests for Result Decoder
 */

import { describe, expect, it } from 'vitest'
import {
  contractResult,
  decodeAddress,
  decodeBase64,
  decodeBool,
  decodeBytes,
  decodeString,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  encodeBase64,
} from '../decoder/result-decoder'

describe('Result Decoder', () => {
  describe('decodeU8', () => {
    it('should decode u8 values', () => {
      const bytes = new Uint8Array([42])
      const result = decodeU8(bytes)
      expect(result.value).toBe(42)
      expect(result.consumed).toBe(1)
      expect(result.type).toBe('u8')
    })

    it('should decode u8 with offset', () => {
      const bytes = new Uint8Array([0, 0, 255])
      const result = decodeU8(bytes, 2)
      expect(result.value).toBe(255)
      expect(result.consumed).toBe(1)
    })

    it('should throw on insufficient bytes', () => {
      const bytes = new Uint8Array([])
      expect(() => decodeU8(bytes)).toThrow('Insufficient bytes')
    })
  })

  describe('decodeU16', () => {
    it('should decode u16 values', () => {
      const bytes = new Uint8Array([0x01, 0x00]) // 256 in big-endian
      const result = decodeU16(bytes)
      expect(result.value).toBe(256)
      expect(result.consumed).toBe(2)
    })

    it('should decode max u16', () => {
      const bytes = new Uint8Array([0xff, 0xff])
      const result = decodeU16(bytes)
      expect(result.value).toBe(65535)
    })
  })

  describe('decodeU32', () => {
    it('should decode u32 values', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x32]) // 50
      const result = decodeU32(bytes)
      expect(result.value).toBe(50)
      expect(result.consumed).toBe(4)
    })

    it('should decode larger u32', () => {
      const bytes = new Uint8Array([0x00, 0x01, 0x00, 0x00]) // 65536
      const result = decodeU32(bytes)
      expect(result.value).toBe(65536)
    })

    it('should decode max u32', () => {
      const bytes = new Uint8Array([0xff, 0xff, 0xff, 0xff])
      const result = decodeU32(bytes)
      expect(result.value).toBe(0xffffffff)
    })
  })

  describe('decodeU64', () => {
    it('should decode u64 values as bigint', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2a]) // 42
      const result = decodeU64(bytes)
      expect(result.value).toBe(42n)
      expect(result.consumed).toBe(8)
    })

    it('should decode large u64', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00])
      const result = decodeU64(bytes)
      expect(result.value).toBe(0x100000000n)
    })
  })

  describe('decodeBool', () => {
    it('should decode true', () => {
      const bytes = new Uint8Array([0x01])
      const result = decodeBool(bytes)
      expect(result.value).toBe(true)
      expect(result.consumed).toBe(1)
    })

    it('should decode false', () => {
      const bytes = new Uint8Array([0x00])
      const result = decodeBool(bytes)
      expect(result.value).toBe(false)
      expect(result.consumed).toBe(1)
    })
  })

  describe('decodeAddress', () => {
    it('should decode 32-byte address to bech32', () => {
      // Create a 32-byte address (all zeros for testing)
      const bytes = new Uint8Array(32).fill(0)
      const result = decodeAddress(bytes)

      expect(result.value).toMatch(/^klv1/)
      expect(result.consumed).toBe(32)
      expect(result.type).toBe('Address')
    })

    it('should throw on insufficient bytes', () => {
      const bytes = new Uint8Array(20) // Only 20 bytes
      expect(() => decodeAddress(bytes)).toThrow('Insufficient bytes')
    })
  })

  describe('decodeString', () => {
    it('should decode string without length prefix', () => {
      const bytes = new TextEncoder().encode('hello')
      const result = decodeString(bytes)

      expect(result.value).toBe('hello')
      expect(result.consumed).toBe(5)
      expect(result.type).toBe('string')
    })

    it('should decode string with length prefix', () => {
      // Length: 5 = 0x00000005, followed by "hello"
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
      const result = decodeString(bytes, 0, true)

      expect(result.value).toBe('hello')
      expect(result.consumed).toBe(9) // 4 bytes length + 5 bytes data
    })

    it('should decode empty string', () => {
      const bytes = new Uint8Array([])
      const result = decodeString(bytes)

      expect(result.value).toBe('')
      expect(result.consumed).toBe(0)
    })
  })

  describe('decodeBytes', () => {
    it('should decode bytes without length prefix', () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03])
      const result = decodeBytes(bytes)

      expect(result.value).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
      expect(result.consumed).toBe(3)
    })

    it('should decode bytes with length prefix', () => {
      // Length: 3 = 0x00000003, followed by bytes
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x03, 0x01, 0x02, 0x03])
      const result = decodeBytes(bytes, 0, true)

      expect(result.value).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
      expect(result.consumed).toBe(7) // 4 bytes length + 3 bytes data
    })
  })

  describe('base64 encoding/decoding', () => {
    it('should encode bytes to base64', () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03])
      const base64 = encodeBase64(bytes)

      // Should be a valid base64 string
      expect(base64).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('should decode base64 to bytes', () => {
      const base64 = 'AQIDBA==' // [1, 2, 3, 4]
      const bytes = decodeBase64(base64)

      expect(Array.from(bytes)).toEqual([1, 2, 3, 4])
    })

    it('should roundtrip base64 encode/decode', () => {
      const original = new Uint8Array([0xff, 0x00, 0x42, 0xaa])
      const base64 = encodeBase64(original)
      const decoded = decodeBase64(base64)

      expect(Array.from(decoded)).toEqual(Array.from(original))
    })
  })

  describe('contractResult helper', () => {
    it('should expose all decoding functions', () => {
      expect(contractResult.u8).toBe(decodeU8)
      expect(contractResult.u16).toBe(decodeU16)
      expect(contractResult.u32).toBe(decodeU32)
      expect(contractResult.u64).toBe(decodeU64)
      expect(contractResult.bool).toBe(decodeBool)
      expect(contractResult.address).toBe(decodeAddress)
      expect(contractResult.string).toBe(decodeString)
      expect(contractResult.bytes).toBe(decodeBytes)
      expect(contractResult.fromBase64).toBe(decodeBase64)
      expect(contractResult.toBase64).toBe(encodeBase64)
    })
  })

  describe('integration: encode and decode', () => {
    it('should roundtrip u32 values', async () => {
      const { encodeU32 } = await import('../encoder/param-encoder')

      const value = 12345
      const encoded = encodeU32(value)

      // For decoding, u32 is always 4 bytes in results
      const padded = new Uint8Array(4)
      const encodedArray = Array.from(encoded)
      padded.set(encodedArray, 4 - encodedArray.length) // Pad left with zeros

      const decoded = decodeU32(padded)
      expect(decoded.value).toBe(value)
    })

    it('should roundtrip bool values', async () => {
      const { encodeBool } = await import('../encoder/param-encoder')

      const encoded = encodeBool(true)
      const decoded = decodeBool(encoded)
      expect(decoded.value).toBe(true)
    })

    it('should roundtrip string values', async () => {
      const { encodeString } = await import('../encoder/param-encoder')

      const value = 'test string'
      const encoded = encodeString(value, true) // With length prefix
      const decoded = decodeString(encoded, 0, true)
      expect(decoded.value).toBe(value)
    })
  })
})
