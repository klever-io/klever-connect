import { describe, it, expect } from 'vitest'
import {
  hexEncode,
  hexDecode,
  base58Encode,
  base58Decode,
  base64Encode,
  base64Decode,
  bech32Encode,
  bech32Decode,
  encodeHex,
  hashBlake2b,
} from '@klever/connect-encoding'

const SAMPLE = new Uint8Array([1, 2, 3, 255, 0, 128])

describe('encoding-utilities', () => {
  it('hex round-trips', () => {
    expect(hexEncode(SAMPLE)).toBe('010203ff0080')
    expect(Array.from(hexDecode('010203ff0080'))).toEqual([1, 2, 3, 255, 0, 128])
  })

  it('hexDecode accepts 0x prefix', () => {
    expect(Array.from(hexDecode('0x010203ff0080'))).toEqual([1, 2, 3, 255, 0, 128])
  })

  it('base58 round-trips', () => {
    expect(Array.from(base58Decode(base58Encode(SAMPLE)))).toEqual(Array.from(SAMPLE))
  })

  it('base64 round-trips', () => {
    expect(Array.from(base64Decode(base64Encode(SAMPLE)))).toEqual(Array.from(SAMPLE))
  })

  it('bech32 encodes a 32-byte hash with klv prefix', () => {
    const addr = bech32Encode(new Uint8Array(32).fill(0))
    expect(addr.startsWith('klv1')).toBe(true)
    const decoded = bech32Decode(addr)
    expect(decoded.data.length).toBe(32)
  })

  it('encodeHex produces a 0x-prefixed hex of the UTF-8 bytes', () => {
    expect(encodeHex('transfer')).toBe('0x7472616e73666572')
    expect(encodeHex('')).toBe('0x')
  })

  it('hashBlake2b produces a deterministic 32-byte digest by default', () => {
    const a = hashBlake2b(new TextEncoder().encode('hello'))
    const b = hashBlake2b(new TextEncoder().encode('hello'))
    expect(a.length).toBe(32)
    expect(hexEncode(a)).toBe(hexEncode(b))
  })

  it('hashBlake2b honours custom output length', () => {
    expect(hashBlake2b(new TextEncoder().encode('hello'), 20).length).toBe(20)
  })
})
