import { describe, expect, it } from 'vitest'
import { getCleanType, getJSType, ABITypeMap } from '../type-mapper'

describe('ABITypeMap', () => {
  it('has all expected categories', () => {
    expect(Object.keys(ABITypeMap)).toEqual(['number', 'string', 'array', 'checkbox', 'variadic'])
  })
})

describe('getCleanType', () => {
  it('returns lowercased type for known types', () => {
    expect(getCleanType('u64')).toBe('u64')
    expect(getCleanType('BigUint')).toBe('biguint')
    expect(getCleanType('bool')).toBe('bool')
  })

  it('strips Option wrapper', () => {
    expect(getCleanType('Option<u64>')).toBe('u64')
    expect(getCleanType('Option<BigUint>')).toBe('biguint')
    expect(getCleanType('Option<bool>')).toBe('bool')
  })

  it('strips generics from unknown types', () => {
    expect(getCleanType('MyStruct<u64>')).toBe('mystruct')
  })

  it('preserves case when toLower is false', () => {
    expect(getCleanType('BigUint', false)).toBe('BigUint')
    expect(getCleanType('Option<BigUint>', false)).toBe('BigUint')
  })

  it('returns custom struct name lowercased', () => {
    expect(getCleanType('MyCustomStruct')).toBe('mycustomstruct')
  })
})

describe('getJSType', () => {
  it('maps numeric types to "number"', () => {
    expect(getJSType('u8')).toBe('number')
    expect(getJSType('u16')).toBe('number')
    expect(getJSType('u32')).toBe('number')
    expect(getJSType('u64')).toBe('number')
    expect(getJSType('i8')).toBe('number')
    expect(getJSType('i16')).toBe('number')
    expect(getJSType('i32')).toBe('number')
    expect(getJSType('i64')).toBe('number')
    expect(getJSType('BigUint')).toBe('number')
    expect(getJSType('BigInt')).toBe('number')
    expect(getJSType('usize')).toBe('number')
    expect(getJSType('isize')).toBe('number')
  })

  it('maps string-like types to "string"', () => {
    expect(getJSType('Address')).toBe('string')
    expect(getJSType('TokenIdentifier')).toBe('string')
    expect(getJSType('ManagedBuffer')).toBe('string')
    expect(getJSType('String')).toBe('string')
    expect(getJSType('bytes')).toBe('string')
    expect(getJSType('BoxedBytes')).toBe('string')
  })

  it('maps bool to "checkbox"', () => {
    expect(getJSType('bool')).toBe('checkbox')
  })

  it('maps collection types to "array"', () => {
    expect(getJSType('List<u64>')).toBe('array')
    expect(getJSType('Array<u32>')).toBe('array')
  })

  it('maps variadic types to "variadic"', () => {
    expect(getJSType('variadic<u64>')).toBe('variadic')
    expect(getJSType('multi<u64,u32>')).toBe('variadic')
  })

  it('handles Option-wrapped types', () => {
    expect(getJSType('Option<u64>')).toBe('number')
    expect(getJSType('Option<bool>')).toBe('checkbox')
    expect(getJSType('Option<Address>')).toBe('string')
  })

  it('returns raw type for unknown custom types', () => {
    expect(getJSType('MyCustomStruct')).toBe('MyCustomStruct')
  })
})
