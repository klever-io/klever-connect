import { describe, it, expect } from 'vitest'
import { parseKLV, formatKLV } from '@klever/connect'

describe('format-parse-klv', () => {
  it('parses integer amounts', () => {
    expect(parseKLV('1')).toBe(1_000_000n)
    expect(parseKLV('100')).toBe(100_000_000n)
  })

  it('parses fractional amounts up to 6 decimals', () => {
    expect(parseKLV('1.5')).toBe(1_500_000n)
    expect(parseKLV('12.345678')).toBe(12_345_678n)
    expect(parseKLV('0.000001')).toBe(1n)
  })

  it('handles zero', () => {
    expect(parseKLV('0')).toBe(0n)
    expect(formatKLV(0n)).toBe('0')
  })

  it('round-trips parseKLV -> formatKLV', () => {
    const cases = ['1', '0.5', '12.345678', '1000', '999999999.999999']
    for (const c of cases) {
      expect(formatKLV(parseKLV(c))).toBe(c)
    }
  })

  it('safely handles bigint addition without precision loss', () => {
    const a = parseKLV('999999999.999999')
    const b = parseKLV('0.000001')
    expect(formatKLV(a + b)).toBe('1000000000')
  })
})
