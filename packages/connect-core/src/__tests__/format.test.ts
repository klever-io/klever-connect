import { describe, it, expect } from 'vitest'
import { formatUnits, parseUnits, formatKLV, parseKLV } from '../format'

describe('formatUnits', () => {
  it('should format whole numbers', () => {
    expect(formatUnits(1000000n)).toBe('1')
    expect(formatUnits(2000000n)).toBe('2')
  })

  it('should format fractional amounts', () => {
    expect(formatUnits(1500000n)).toBe('1.5')
    expect(formatUnits(1234567n)).toBe('1.234567')
  })

  it('should format small amounts', () => {
    expect(formatUnits(500n)).toBe('0.0005')
    expect(formatUnits(1n)).toBe('0.000001')
  })

  it('should accept string values', () => {
    expect(formatUnits('2000000', 6)).toBe('2')
    expect(formatUnits('1500000')).toBe('1.5')
  })

  it('should accept number values', () => {
    expect(formatUnits(1000000)).toBe('1')
  })

  it('should accept custom decimals', () => {
    expect(formatUnits(1000n, 3)).toBe('1')
    expect(formatUnits(1500n, 3)).toBe('1.5')
  })

  it('should trim trailing zeros', () => {
    expect(formatUnits(1100000n)).toBe('1.1')
    expect(formatUnits(1010000n)).toBe('1.01')
  })
})

describe('parseUnits', () => {
  it('should parse whole numbers', () => {
    expect(parseUnits('1')).toBe(1000000n)
    expect(parseUnits('2')).toBe(2000000n)
  })

  it('should parse fractional values', () => {
    expect(parseUnits('1.5')).toBe(1500000n)
    expect(parseUnits('0.000001')).toBe(1n)
  })

  it('should accept number values', () => {
    expect(parseUnits(2.5)).toBe(2500000n)
  })

  it('should accept custom decimals', () => {
    expect(parseUnits('100', 3)).toBe(100000n)
  })

  it('should throw on invalid decimal format', () => {
    expect(() => parseUnits('1.2.3')).toThrow('Invalid decimal value')
  })

  it('should throw on too many decimal places', () => {
    expect(() => parseUnits('1.1234567', 6)).toThrow('Too many decimal places (max 6)')
  })
})

describe('formatKLV', () => {
  it('should format KLV amounts', () => {
    expect(formatKLV(1000000n)).toBe('1')
    expect(formatKLV(1500000n)).toBe('1.5')
    expect(formatKLV('2000000')).toBe('2')
  })
})

describe('parseKLV', () => {
  it('should parse KLV amounts', () => {
    expect(parseKLV('1')).toBe(1000000n)
    expect(parseKLV('1.5')).toBe(1500000n)
    expect(parseKLV(2)).toBe(2000000n)
    expect(parseKLV('0.000001')).toBe(1n)
  })
})
