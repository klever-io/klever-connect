import { describe, it, expect } from 'vitest'
import { parseUnits, formatUnits, parseAssetAmount, formatAssetAmount } from '@klever/connect'

describe('format-parse-kda', () => {
  it('parses with custom precisions', () => {
    expect(parseUnits('1', 0)).toBe(1n)
    expect(parseUnits('1', 6)).toBe(1_000_000n)
    expect(parseUnits('1', 8)).toBe(100_000_000n)
    expect(parseUnits('1.5', 8)).toBe(150_000_000n)
  })

  it('round-trips parseUnits -> formatUnits across precisions', () => {
    // formatUnits drops trailing zeros (canonical decimal form), so the
    // string round-trip only holds for minimal representations.
    const cases: Array<[string, number]> = [
      ['1', 0],
      ['12.345678', 6],
      ['1000.5', 8],
      ['0.123456789012345678', 18],
    ]
    for (const [value, prec] of cases) {
      expect(formatUnits(parseUnits(value, prec), prec)).toBe(value)
    }
    // BigInt -> string -> BigInt round-trip is always exact even when the
    // input has trailing zeros that the string form would canonicalize away.
    const raw = 100050000000n
    expect(parseUnits(formatUnits(raw, 8), 8)).toBe(raw)
  })

  it('parseAssetAmount returns the same numeric value as parseUnits', () => {
    const a = parseUnits('123.456', 6)
    const b = parseAssetAmount('123.456', 6)
    expect(BigInt(b as unknown as bigint)).toBe(a)
  })

  it('formatAssetAmount round-trips parseAssetAmount', () => {
    const branded = parseAssetAmount('1000.5', 8)
    expect(formatAssetAmount(branded, 8)).toBe('1000.5')
  })
})
