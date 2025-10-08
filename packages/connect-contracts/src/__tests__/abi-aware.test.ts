/**
 * Tests for ABI-Aware Encoding and Decoding
 */

import { describe, it, expect } from 'vitest'
import { ABIEncoder, encodeByType } from '../encoder/abi-encoder'
import { ABIDecoder, decodeByType } from '../decoder/abi-decoder'
import diceAbi from '../../examples/dice/dice.abi.json'
import { loadABI } from '../utils'

describe('ABI-Aware Encoding', () => {
  const abi = loadABI(diceAbi)
  const encoder = new ABIEncoder(abi)

  describe('Primitive Types', () => {
    it('should encode u8', () => {
      const result = encodeByType(42, 'u8', abi)
      expect(result).toEqual(new Uint8Array([0x2a]))
    })

    it('should encode u8 from string', () => {
      const result = encodeByType('42', 'u8', abi)
      expect(result).toEqual(new Uint8Array([0x2a]))
    })

    it('should encode u16', () => {
      const result = encodeByType(1000, 'u16', abi)
      expect(result).toEqual(new Uint8Array([0x03, 0xe8]))
    })

    it('should encode u32', () => {
      const result = encodeByType(50, 'u32', abi)
      expect(result).toEqual(new Uint8Array([0x32]))
    })

    it('should encode u32 from string', () => {
      const result = encodeByType('50', 'u32', abi)
      expect(result).toEqual(new Uint8Array([0x32]))
    })

    it('should encode u64', () => {
      const result = encodeByType(123456789n, 'u64', abi)
      expect(result).toEqual(new Uint8Array([0x07, 0x5b, 0xcd, 0x15]))
    })

    it('should encode u64 from string', () => {
      const result = encodeByType('123456789', 'u64', abi)
      expect(result).toEqual(new Uint8Array([0x07, 0x5b, 0xcd, 0x15]))
    })

    it('should encode bool', () => {
      expect(encodeByType(true, 'bool', abi)).toEqual(new Uint8Array([0x01]))
      expect(encodeByType(false, 'bool', abi)).toEqual(new Uint8Array([0x00]))
    })

    it('should encode Address', () => {
      const address = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const result = encodeByType(address, 'Address', abi)
      expect(result.length).toBe(32)
    })
  })

  describe('Variable-Length Types', () => {
    it('should encode string (top-level)', () => {
      const result = encodeByType('hello', 'utf-8 string', abi, false)
      expect(result).toEqual(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]))
    })

    it('should encode string (nested)', () => {
      const result = encodeByType('hi', 'utf-8 string', abi, true)
      // Should have 4-byte length prefix + data
      expect(result.slice(0, 4)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x02]))
      expect(result.slice(4)).toEqual(new Uint8Array([0x68, 0x69]))
    })

    it('should encode bytes (top-level)', () => {
      const data = new Uint8Array([0x01, 0x02, 0x03])
      const result = encodeByType(data, 'bytes', abi, false)
      expect(result).toEqual(data)
    })

    it('should encode bytes (nested)', () => {
      const data = new Uint8Array([0xaa, 0xbb])
      const result = encodeByType(data, 'bytes', abi, true)
      // Should have 4-byte length prefix + data
      expect(result.slice(0, 4)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x02]))
      expect(result.slice(4)).toEqual(data)
    })
  })

  describe('BigUint/BigInt', () => {
    it('should encode BigUint (top-level)', () => {
      const result = encodeByType(1000000n, 'BigUint', abi, false)
      expect(result).toEqual(new Uint8Array([0x0f, 0x42, 0x40]))
    })

    it('should encode BigUint (nested)', () => {
      const result = encodeByType(255n, 'BigUint', abi, true)
      // Should have 4-byte length prefix + 1 byte data
      expect(result.slice(0, 4)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x01]))
      expect(result[4]).toBe(0xff)
    })

    it('should encode zero BigUint', () => {
      const result = encodeByType(0n, 'BigUint', abi, false)
      expect(result).toEqual(new Uint8Array([0x00]))
    })

    it('should convert number to BigUint', () => {
      const result = encodeByType(1000, 'BigUint', abi, false)
      expect(result).toEqual(new Uint8Array([0x03, 0xe8]))
    })
  })

  describe('Enum Types', () => {
    it('should encode enum by discriminant', () => {
      const result = encodeByType(0, 'BetType', abi)
      expect(result).toEqual(new Uint8Array([0x00]))
    })

    it('should encode enum by name', () => {
      const result = encodeByType('OVER', 'BetType', abi)
      expect(result).toEqual(new Uint8Array([0x01]))
    })

    it('should encode enum by numeric string', () => {
      // Test with leading zero
      const result1 = encodeByType('01', 'BetType', abi)
      expect(result1).toEqual(new Uint8Array([0x01]))

      // Test without leading zero
      const result2 = encodeByType('0', 'BetType', abi)
      expect(result2).toEqual(new Uint8Array([0x00]))

      // Test regular number string
      const result3 = encodeByType('1', 'BetType', abi)
      expect(result3).toEqual(new Uint8Array([0x01]))
    })
  })

  describe('Option Types', () => {
    it('should encode None', () => {
      const result = encodeByType(null, 'Option<u32>', abi)
      expect(result).toEqual(new Uint8Array([0x00]))
    })

    it('should encode Some', () => {
      const result = encodeByType(42, 'Option<u32>', abi)
      expect(result[0]).toBe(0x01) // Some discriminant
      // Nested u32 is fixed 4 bytes, no length prefix
      expect(result.slice(1)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x2a])) // u32: 42 (4 bytes fixed)
    })
  })

  describe('List/Vec Types', () => {
    it('should encode empty list', () => {
      const result = encodeByType([], 'List<u32>', abi)
      // Count = 0 (4-byte fixed)
      expect(result).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00]))
    })

    it('should encode list of numbers', () => {
      const result = encodeByType([1, 2, 3], 'List<u32>', abi)
      // Count = 3 (4-byte fixed), then items (4 bytes each, nested)
      expect(result.slice(0, 4)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x03]))
      // Count (4 bytes) + 3 items (4 bytes each) = 16 bytes
      expect(result.length).toBe(16)
    })
  })

  describe('Struct Types', () => {
    it('should encode struct', () => {
      const bet = {
        bet_type: 0,
        bet_value: 50,
        dice_value: 25,
        multiplier: 195000, // u32 value
        is_winner: true,
      }
      const result = encodeByType(bet, 'Bet', abi)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should throw on missing field', () => {
      const incomplete = {
        bet_type: 0,
        // Missing other fields
      }
      expect(() => encodeByType(incomplete, 'Bet', abi)).toThrow(/Missing field/)
    })
  })

  describe('Function Arguments', () => {
    it('should encode function arguments', () => {
      const args = encoder.encodeFunctionArgs('bet', [0, 50])
      expect(args).toHaveLength(2)
      expect(args[0]).toEqual(new Uint8Array([0x00])) // BetType
      expect(args[1]).toEqual(new Uint8Array([0x32])) // u32(50)
    })

    it('should encode constructor arguments', () => {
      const args = encoder.encodeConstructorArgs([])
      expect(args).toEqual([])
    })

    it('should throw on argument count mismatch', () => {
      expect(() => encoder.encodeFunctionArgs('bet', [0])).toThrow(/Expected 2 arguments/)
    })
  })
})

describe('ABI-Aware Decoding', () => {
  const abi = loadABI(diceAbi)
  const decoder = new ABIDecoder(abi)

  describe('Primitive Types', () => {
    it('should decode u8', () => {
      const bytes = new Uint8Array([0x2a])
      const result = decodeByType(bytes, 'u8', abi)
      expect(result.value).toBe(42)
      expect(result.consumed).toBe(1)
    })

    it('should decode u16', () => {
      const bytes = new Uint8Array([0x03, 0xe8])
      const result = decodeByType(bytes, 'u16', abi)
      expect(result.value).toBe(1000)
      expect(result.consumed).toBe(2)
    })

    it('should decode u32 (full 4 bytes)', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x32])
      const result = decodeByType(bytes, 'u32', abi)
      expect(result.value).toBe(50)
    })

    it('should decode u64', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x07, 0x5b, 0xcd, 0x15])
      const result = decodeByType(bytes, 'u64', abi)
      expect(result.value).toBe(123456789n)
    })

    it('should decode bool', () => {
      expect(decodeByType(new Uint8Array([0x01]), 'bool', abi).value).toBe(true)
      expect(decodeByType(new Uint8Array([0x00]), 'bool', abi).value).toBe(false)
    })
  })

  describe('Variable-Length Types', () => {
    it('should decode string (top-level)', () => {
      const bytes = new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]) // "hello"
      const result = decodeByType(bytes, 'utf-8 string', abi, 0, false)
      expect(result.value).toBe('hello')
    })

    it('should decode string (nested)', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x02, 0x68, 0x69]) // "hi"
      const result = decodeByType(bytes, 'utf-8 string', abi, 0, true)
      expect(result.value).toBe('hi')
      expect(result.consumed).toBe(6)
    })

    it('should decode bytes', () => {
      const data = new Uint8Array([0x01, 0x02, 0x03])
      const result = decodeByType(data, 'bytes', abi, 0, false)
      expect(result.value).toEqual(data)
    })
  })

  describe('BigUint/BigInt', () => {
    it('should decode BigUint (top-level)', () => {
      const bytes = new Uint8Array([0x0f, 0x42, 0x40])
      const result = decodeByType(bytes, 'BigUint', abi, 0, false)
      expect(result.value).toBe(1000000n)
    })

    it('should decode BigUint (nested)', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x01, 0xff])
      const result = decodeByType(bytes, 'BigUint', abi, 0, true)
      expect(result.value).toBe(255n)
      expect(result.consumed).toBe(5)
    })

    it('should decode zero BigUint', () => {
      const result = decodeByType(new Uint8Array([0x00]), 'BigUint', abi, 0, false)
      expect(result.value).toBe(0n)
    })
  })

  describe('Enum Types', () => {
    it('should decode enum', () => {
      const result = decodeByType(new Uint8Array([0x01]), 'BetType', abi)
      // Enum is decoded as discriminant number for simplicity
      expect(result.value).toBe(1)
      expect(result.consumed).toBe(1)
    })

    it('should throw on invalid discriminant', () => {
      expect(() => decodeByType(new Uint8Array([0xff]), 'BetType', abi)).toThrow(
        /Unknown enum variant/,
      )
    })
  })

  describe('Option Types', () => {
    it('should decode None', () => {
      const result = decodeByType(new Uint8Array([0x00]), 'Option<u32>', abi)
      expect(result.value).toBe(null)
      expect(result.consumed).toBe(1)
    })

    it('should decode Some with nested u32', () => {
      // Some(42): discriminant(1) + fixed 4-byte u32
      const bytes = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x2a])
      const result = decodeByType(bytes, 'Option<u32>', abi)
      expect(result.value).toBe(42)
      expect(result.consumed).toBe(5)
    })
  })

  describe('List/Vec Types', () => {
    it('should decode empty list', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]) // count = 0 (4 bytes fixed)
      const result = decodeByType(bytes, 'List<u32>', abi)
      expect(result.value).toEqual([])
      expect(result.consumed).toBe(4)
    })

    it('should decode list with fixed count and nested items', () => {
      // Count is always 4-byte fixed, items are nested (fixed-size)
      const bytes = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x02, // count = 2 (4 bytes fixed)
        0x00,
        0x00,
        0x00,
        0x01, // first item: u32 = 1 (4 bytes fixed, nested)
        0x00,
        0x00,
        0x00,
        0x02, // second item: u32 = 2 (4 bytes fixed, nested)
      ])
      const result = decodeByType(bytes, 'List<u32>', abi)
      expect(result.value).toEqual([1, 2])
      expect(result.consumed).toBe(12) // 4 byte count + 8 bytes items
    })
  })

  describe('Struct Types', () => {
    it('should decode struct with nested fields', () => {
      // Bet struct: bet_type(u32), bet_value(u32), dice_value(u32), multiplier(u32), is_winner(bool)
      // Note: bet_type is u32, not enum (the enum is separate)
      // Struct fields ARE nested but fixed-size types have NO length prefix:
      // - u32: 4 bytes fixed, no prefix
      // - bool: 1 byte, no prefix
      const bytes = new Uint8Array([
        // bet_type = 0 (u32: 4 bytes fixed)
        0x00, 0x00, 0x00, 0x00,
        // bet_value = 50 (u32: 4 bytes fixed)
        0x00, 0x00, 0x00, 0x32,
        // dice_value = 25 (u32: 4 bytes fixed)
        0x00, 0x00, 0x00, 0x19,
        // multiplier = 195000 = 0x02f9b8 (u32: 4 bytes fixed)
        0x00, 0x02, 0xf9, 0xb8,
        // is_winner = true (bool: 1 byte)
        0x01,
      ])

      const result = decodeByType(bytes, 'Bet', abi)
      const bet = result.value as Record<string, unknown>
      expect(bet.bet_type).toBe(0)
      expect(bet.bet_value).toBe(50)
      expect(bet.dice_value).toBe(25)
      expect(bet.multiplier).toBe(195000)
      expect(bet.is_winner).toBe(true)
    })
  })

  describe('Function Results', () => {
    it('should decode function results from base64', () => {
      const fullStruct = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x00, // bet_type (u32: 4 bytes fixed)
        0x00,
        0x00,
        0x00,
        0x32, // bet_value (u32: 4 bytes fixed)
        0x00,
        0x00,
        0x00,
        0x19, // dice_value (u32: 4 bytes fixed)
        0x00,
        0x02,
        0xf9,
        0xb8, // multiplier (u32: 4 bytes fixed)
        0x01, // is_winner (bool: 1 byte)
      ])

      const base64Data = [Buffer.from(fullStruct).toString('base64')]
      const results = decoder.decodeFunctionResults('getLastResult', base64Data)
      expect(results).toHaveLength(1)
      const bet = results[0] as Record<string, unknown>
      expect(bet.bet_value).toBe(50)
      expect(bet.dice_value).toBe(25)
      expect(bet.is_winner).toBe(true)
    })

    it('should decode from Uint8Array', () => {
      const fullStruct = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x00, // bet_type (u32: 4 bytes fixed)
        0x00,
        0x00,
        0x00,
        0x32, // bet_value (u32: 4 bytes fixed)
        0x00,
        0x00,
        0x00,
        0x19, // dice_value (u32: 4 bytes fixed)
        0x00,
        0x02,
        0xf9,
        0xb8, // multiplier (u32: 4 bytes fixed)
        0x01, // is_winner (bool: 1 byte)
      ])
      const data = [fullStruct]
      const results = decoder.decodeFunctionResults('getLastResult', data)
      expect(results).toHaveLength(1)
      const bet = results[0] as Record<string, unknown>
      expect(bet.bet_type).toBe(0)
      expect(bet.multiplier).toBe(195000)
    })

    it('should throw on result count mismatch', () => {
      expect(() => decoder.decodeFunctionResults('getLastResult', [])).toThrow(
        /Expected 1 return values/,
      )
    })
  })

  describe('Single Value Decoding', () => {
    it('should decode single value', () => {
      const bytes = new Uint8Array([0x2a])
      const result = decoder.decodeValue(bytes, 'u8')
      expect(result).toBe(42)
    })
  })
})

describe('Round-Trip Encoding/Decoding', () => {
  const abi = loadABI(diceAbi)

  it('should encode and decode u32 (top-level)', () => {
    const original = 12345
    const encoded = encodeByType(original, 'u32', abi, false)
    const decoded = decodeByType(encoded, 'u32', abi, 0, false)
    expect(decoded.value).toBe(original)
  })

  it('should encode and decode u32 (nested)', () => {
    const original = 12345
    const encoded = encodeByType(original, 'u32', abi, true)
    const decoded = decodeByType(encoded, 'u32', abi, 0, true)
    expect(decoded.value).toBe(original)
  })

  it('should encode and decode BigUint', () => {
    const original = 999999999999n
    const encoded = encodeByType(original, 'BigUint', abi, false)
    const decoded = decodeByType(encoded, 'BigUint', abi, 0, false)
    expect(decoded.value).toBe(original)
  })

  it('should encode and decode string (nested)', () => {
    const original = 'test string'
    const encoded = encodeByType(original, 'utf-8 string', abi, true)
    const decoded = decodeByType(encoded, 'utf-8 string', abi, 0, true)
    expect(decoded.value).toBe(original)
  })

  it('should encode and decode Option<u32>', () => {
    const original = 42
    const encoded = encodeByType(original, 'Option<u32>', abi, false)
    const decoded = decodeByType(encoded, 'Option<u32>', abi, 0, false)
    expect(decoded.value).toBe(original)
  })

  it('should encode and decode enum (top-level)', () => {
    const original = 'OVER' // OVER = discriminant 1
    const encoded = encodeByType(original, 'BetType', abi, false)
    const decoded = decodeByType(encoded, 'BetType', abi, 0, false)
    // Enum is decoded as discriminant number
    expect(decoded.value).toBe(1)
  })

  it('should encode and decode enum (nested)', () => {
    const original = 'UNDER' // UNDER = discriminant 0
    const encoded = encodeByType(original, 'BetType', abi, true)
    const decoded = decodeByType(encoded, 'BetType', abi, 0, true)
    // Enum is decoded as discriminant number
    expect(decoded.value).toBe(0)
  })
})
