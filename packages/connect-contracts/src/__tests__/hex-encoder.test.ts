import { describe, expect, it } from 'vitest'
import { encodeABIValue, encodeLengthPlusData, encodeWithABI } from '../encoder/hex-encoder'

describe('encodeABIValue', () => {
  describe('unsigned integers', () => {
    it('encodes u8 nested', () => {
      expect(encodeABIValue(255, 'u8', true)).toBe('ff')
      expect(encodeABIValue(0, 'u8', true)).toBe('00')
      expect(encodeABIValue(1, 'u8', true)).toBe('01')
    })

    it('encodes u16 nested', () => {
      expect(encodeABIValue(256, 'u16', true)).toBe('0100')
      expect(encodeABIValue(0, 'u16', true)).toBe('0000')
    })

    it('encodes u32 nested', () => {
      expect(encodeABIValue(1, 'u32', true)).toBe('00000001')
      expect(encodeABIValue(256, 'u32', true)).toBe('00000100')
    })

    it('encodes u64 nested', () => {
      expect(encodeABIValue(1, 'u64', true)).toBe('0000000000000001')
      expect(encodeABIValue(0, 'u64', true)).toBe('0000000000000000')
    })

    it('encodes u64 top-level (not nested)', () => {
      expect(encodeABIValue(1, 'u64', false)).toBe('01')
      expect(encodeABIValue(256, 'u64', false)).toBe('0100')
    })
  })

  describe('boolean', () => {
    it('encodes true as 01', () => {
      expect(encodeABIValue(true, 'bool')).toBe('01')
    })

    it('encodes false as 00', () => {
      expect(encodeABIValue(false, 'bool')).toBe('00')
    })
  })

  describe('BigUint', () => {
    it('encodes with length prefix when nested', () => {
      expect(encodeABIValue(255, 'BigUint', true)).toBe('0000000200ff')
    })

    it('encodes without length prefix when top-level', () => {
      expect(encodeABIValue(255, 'BigUint', false)).toBe('00ff')
    })

    it('encodes zero', () => {
      expect(encodeABIValue(0, 'BigUint', false)).toBe('00')
    })
  })

  describe('string values as numeric input', () => {
    it('parses string input as number for numeric types', () => {
      expect(encodeABIValue('42', 'u32', true)).toBe('0000002a')
    })

    it('returns empty string for NaN input on numeric types', () => {
      expect(encodeABIValue('abc', 'u32', true)).toBe('')
    })
  })

  describe('Option types', () => {
    it('encodes Option<u64> by unwrapping', () => {
      expect(encodeABIValue(1, 'Option<u64>', true)).toBe('0000000000000001')
    })
  })

  describe('variadic and multi', () => {
    it('encodes variadic<u64> with all items', () => {
      const result = encodeABIValue([1, 2, 3], 'variadic<u64>', false)
      expect(result).toBe('01@02@03')
    })

    it('encodes multi<u64,u32> positionally', () => {
      const result = encodeABIValue([1, 2], 'multi<u64,u32>', false)
      expect(result).toBe('01@02')
    })
  })
})

describe('encodeLengthPlusData', () => {
  it('encodes string with length prefix', () => {
    expect(encodeLengthPlusData('abc', '', true)).toBe('00000003616263')
  })

  it('encodes string without length prefix when not nested', () => {
    expect(encodeLengthPlusData('abc', '', false)).toBe('616263')
  })

  it('returns length prefix for empty string input', () => {
    expect(encodeLengthPlusData('', '', true)).toBe('00000000')
  })

  it('encodes array of values with length prefix', () => {
    const result = encodeLengthPlusData(['1', '2'], 'u8', true)
    // 2 elements (00000002) + '1' as u8 (01) + '2' as u8 (02)
    expect(result).toBe('000000020102')
  })
})

describe('encodeWithABI', () => {
  it('encodes a simple struct', () => {
    const abi = {
      types: {
        MyStruct: {
          type: 'struct',
          fields: [
            { name: 'amount', type: 'u32' },
            { name: 'flag', type: 'bool' },
          ],
        },
      },
    }
    expect(encodeWithABI(abi, { amount: 1, flag: true }, 'MyStruct')).toBe('0000000101')
  })

  it('returns empty string for unknown type', () => {
    expect(encodeWithABI({ types: {} }, {}, 'Unknown')).toBe('')
  })

  it('encodes nested struct with Option field', () => {
    const abi = {
      types: {
        MyStruct: {
          type: 'struct',
          fields: [
            { name: 'value', type: 'u32' },
            { name: 'optional', type: 'Option<u64>' },
          ],
        },
      },
    }

    const withValue = { value: 10, optional: 5 }
    const result = encodeWithABI(abi, withValue, 'MyStruct')
    // value=10 as u32 (0000000a) + option present (01) + optional=5 as u64 (0000000000000005)
    expect(result).toBe('0000000a010000000000000005')

    const withNull = { value: 10, optional: null }
    const resultNull = encodeWithABI(abi, withNull, 'MyStruct')
    // value=10 as u32 (0000000a) + option absent (00)
    expect(resultNull).toBe('0000000a00')
  })

  it('encodes Option<CustomType> with null and non-null values', () => {
    const abi = {
      types: {
        Outer: {
          type: 'struct',
          fields: [{ name: 'inner', type: 'Option<Inner>' }],
        },
        Inner: {
          type: 'struct',
          fields: [{ name: 'x', type: 'u32' }],
        },
      },
    }

    const withValue = { inner: { x: 42 } }
    // option present (01) + x=42 as u32 (0000002a)
    expect(encodeWithABI(abi, withValue, 'Outer')).toBe('010000002a')

    const withNull = { inner: null }
    // option absent (00)
    expect(encodeWithABI(abi, withNull, 'Outer')).toBe('00')
  })
})
