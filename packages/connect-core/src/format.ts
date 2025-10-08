/**
 * Formatting utilities for Klever amounts
 * Similar to ethers.js formatUnits/parseUnits
 *
 * These utilities help convert between human-readable amounts (like "1.5 KLV")
 * and the smallest units used internally (like 1500000).
 */

/**
 * Format a value from its smallest unit to a human-readable string
 *
 * Converts amounts from blockchain smallest units to decimal representation.
 * Trailing zeros are automatically removed from the fractional part.
 *
 * @param value - The value in smallest units (e.g., 1000000 = 1 KLV)
 * @param decimals - The number of decimals (default: 6 for KLV/KFI)
 * @returns Formatted string representation
 *
 * @example
 * ```typescript
 * formatUnits(1000000n) // '1'
 * formatUnits(1500000n) // '1.5'
 * formatUnits(1234567n) // '1.234567'
 * formatUnits(500n) // '0.0005'
 * formatUnits('2000000', 6) // '2'
 * formatUnits(1000, 3) // '1' (with 3 decimals)
 * ```
 *
 * @see {@link parseUnits} for the reverse operation
 * @see {@link formatKLV} for KLV-specific formatting
 */
export function formatUnits(value: bigint | string | number, decimals = 6): string {
  const val = typeof value === 'bigint' ? value : BigInt(value)
  const divisor = 10n ** BigInt(decimals)
  const quotient = val / divisor
  const remainder = val % divisor

  if (remainder === 0n) {
    return quotient.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.replace(/0+$/, '')

  return `${quotient}.${trimmed}`
}

/**
 * Parse a human-readable string to its smallest unit
 *
 * Converts decimal amounts to blockchain smallest units.
 * Throws an error if too many decimal places are provided.
 *
 * @param value - The string or number value (e.g., "1.5" or 1.5)
 * @param decimals - The number of decimals (default: 6 for KLV/KFI)
 * @returns Value in smallest units as bigint
 * @throws {Error} If the value has invalid decimal format or too many decimal places
 *
 * @example
 * ```typescript
 * parseUnits('1') // 1000000n
 * parseUnits('1.5') // 1500000n
 * parseUnits('0.000001') // 1n
 * parseUnits(2.5) // 2500000n
 * parseUnits('100', 3) // 100000n (with 3 decimals)
 *
 * // Throws error - too many decimals
 * parseUnits('1.1234567', 6) // Error: Too many decimal places (max 6)
 *
 * // Throws error - invalid format
 * parseUnits('1.2.3') // Error: Invalid decimal value
 * ```
 *
 * @see {@link formatUnits} for the reverse operation
 * @see {@link parseKLV} for KLV-specific parsing
 */
export function parseUnits(value: string | number, decimals = 6): bigint {
  const str = value.toString()
  const parts = str.split('.')

  if (parts.length > 2) {
    throw new Error('Invalid decimal value')
  }

  const [whole, fraction = ''] = parts

  if (fraction.length > decimals) {
    throw new Error(`Too many decimal places (max ${decimals})`)
  }

  const paddedFraction = fraction.padEnd(decimals, '0')
  const combined = whole + paddedFraction

  return BigInt(combined)
}

/**
 * Format KLV amount from smallest units to human-readable string
 *
 * Convenience function that calls `formatUnits` with 6 decimals (KLV precision).
 *
 * @param amount - Amount in smallest units
 * @returns Formatted KLV string
 *
 * @example
 * ```typescript
 * formatKLV(1000000n) // '1'
 * formatKLV(1500000n) // '1.5'
 * formatKLV('2000000') // '2'
 * ```
 *
 * @see {@link formatUnits} for the underlying implementation
 * @see {@link parseKLV} for the reverse operation
 */
export function formatKLV(amount: bigint | string | number): string {
  return formatUnits(amount, 6)
}

/**
 * Parse KLV amount from human-readable string to smallest units
 *
 * Convenience function that calls `parseUnits` with 6 decimals (KLV precision).
 *
 * @param amount - Human-readable KLV amount
 * @returns Amount in smallest units as bigint
 * @throws {Error} If the amount has invalid format or too many decimals
 *
 * @example
 * ```typescript
 * parseKLV('1') // 1000000n (1 KLV)
 * parseKLV('1.5') // 1500000n (1.5 KLV)
 * parseKLV(2) // 2000000n (2 KLV)
 * parseKLV('0.000001') // 1n (smallest KLV unit)
 * ```
 *
 * @see {@link parseUnits} for the underlying implementation
 * @see {@link formatKLV} for the reverse operation
 */
export function parseKLV(amount: string | number): bigint {
  return parseUnits(amount, 6)
}
