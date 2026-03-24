import { describe, it, expect } from 'vitest'
import {
  base58Encode,
  base58Decode,
  hexEncode,
  hexDecode,
  bech32Encode,
  bech32Decode,
  base64Encode,
  base64Decode,
} from '../encoding'

describe('encoding', () => {
  describe('hexEncode / hexDecode', () => {
    it('should encode bytes to hex string', () => {
      const data = new Uint8Array([255, 0, 128, 15])
      expect(hexEncode(data)).toBe('ff00800f')
    })

    it('should encode empty bytes to empty string', () => {
      expect(hexEncode(new Uint8Array())).toBe('')
    })

    it('should pad single-digit hex values', () => {
      const data = new Uint8Array([1, 2, 3])
      expect(hexEncode(data)).toBe('010203')
    })

    it('should decode hex string to bytes', () => {
      const bytes = hexDecode('ff00800f')
      expect(bytes).toEqual(new Uint8Array([255, 0, 128, 15]))
    })

    it('should decode hex string with 0x prefix', () => {
      const bytes = hexDecode('0xff00800f')
      expect(bytes).toEqual(new Uint8Array([255, 0, 128, 15]))
    })

    it('should decode hex string with 0X prefix', () => {
      const bytes = hexDecode('0Xff00800f')
      expect(bytes).toEqual(new Uint8Array([255, 0, 128, 15]))
    })

    it('should decode empty hex string to empty bytes', () => {
      expect(hexDecode('')).toEqual(new Uint8Array())
    })

    it('should throw on odd-length hex string', () => {
      expect(() => hexDecode('abc')).toThrow('Hex string must have even length')
    })

    it('should throw on non-hex characters', () => {
      expect(() => hexDecode('zz')).toThrow('Hex string contains non-hex characters')
    })

    it('should roundtrip encode/decode', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128])
      expect(hexDecode(hexEncode(original))).toEqual(original)
    })

    it('should accept Node.js Buffer as input', () => {
      const buf = Buffer.from([1, 2, 3, 4])
      expect(hexEncode(buf)).toBe('01020304')
      expect(hexDecode(hexEncode(buf))).toEqual(buf)
    })
  })

  describe('base58Encode / base58Decode', () => {
    it('should encode and decode bytes', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const encoded = base58Encode(data)
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
      expect(base58Decode(encoded)).toEqual(data)
    })

    it('should roundtrip 32 bytes', () => {
      const data = new Uint8Array(32).fill(42)
      expect(base58Decode(base58Encode(data))).toEqual(data)
    })
  })

  describe('base64Encode / base64Decode', () => {
    it('should encode bytes to base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      expect(base64Encode(data)).toBe('SGVsbG8=')
    })

    it('should decode base64 to bytes', () => {
      const decoded = base64Decode('SGVsbG8=')
      expect(decoded).toEqual(new Uint8Array([72, 101, 108, 108, 111]))
    })

    it('should encode empty bytes', () => {
      expect(base64Encode(new Uint8Array())).toBe('')
    })

    it('should decode empty string', () => {
      expect(base64Decode('')).toEqual(new Uint8Array())
    })

    it('should roundtrip binary data', () => {
      const data = new Uint8Array([0, 1, 2, 3, 4, 5])
      expect(base64Decode(base64Encode(data))).toEqual(data)
    })
  })

  describe('bech32Encode / bech32Decode', () => {
    const zeroAddress = new Uint8Array(32)

    it('should encode 32 bytes to klv1 address', () => {
      const address = bech32Encode(zeroAddress)
      expect(address).toMatch(/^klv1/)
    })

    it('should encode with custom prefix', () => {
      const address = bech32Encode(zeroAddress, 'tklv')
      expect(address).toMatch(/^tklv1/)
    })

    it('should decode klv1 address back to bytes', () => {
      const address = bech32Encode(zeroAddress)
      const { prefix, data } = bech32Decode(address)
      expect(prefix).toBe('klv')
      expect(data).toEqual(zeroAddress)
      expect(data.length).toBe(32)
    })

    it('should decode address with custom prefix', () => {
      const address = bech32Encode(zeroAddress, 'tklv')
      const { prefix, data } = bech32Decode(address)
      expect(prefix).toBe('tklv')
      expect(data).toEqual(zeroAddress)
    })

    it('should throw on address with wrong data length', () => {
      // Encode 20 bytes — valid bech32 but not the required 32-byte length
      const shortAddr = bech32Encode(new Uint8Array(20))
      expect(() => bech32Decode(shortAddr)).toThrow('Invalid address length')
    })

    it('should roundtrip known public key bytes', () => {
      const pubKey = new Uint8Array(32)
      pubKey.fill(0xab)
      const address = bech32Encode(pubKey)
      const { data } = bech32Decode(address)
      expect(data).toEqual(pubKey)
    })
  })
})
