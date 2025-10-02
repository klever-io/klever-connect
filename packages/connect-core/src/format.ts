/**
 * Formatting utilities for Klever amounts
 * Similar to ethers.js formatUnits/parseUnits
 */

/**
 * Format a value from its smallest unit to a human-readable string
 * @param value The value in smallest units (e.g., 1000000 = 1 KLV)
 * @param decimals The number of decimals (default: 6 for KLV)
 * @returns Formatted string representation
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
 * @param value The string value (e.g., "1.5")
 * @param decimals The number of decimals (default: 6 for KLV)
 * @returns Value in smallest units as bigint
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
 * Format KLV from smallest unit to human-readable
 * @param amount Amount in smallest units
 * @returns Formatted KLV string
 */
export function formatKLV(amount: bigint | string | number): string {
  return formatUnits(amount, 6)
}

/**
 * Parse KLV from human-readable to smallest unit
 * @param amount Human-readable KLV amount
 * @returns Amount in smallest units
 */
export function parseKLV(amount: string | number): bigint {
  return parseUnits(amount, 6)
}
