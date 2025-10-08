/**
 * Branded types for type-safe value handling
 */
import { bech32Decode } from '@klever/connect-encoding'

/**
 * Brand type helper for creating nominal types
 * @internal
 */
type Brand<K, T> = K & { __brand: T }

/**
 * A branded type representing a valid Klever address
 * Must start with 'klv1' and be exactly 62 characters long
 *
 * @example
 * ```typescript
 * const address: KleverAddress = createKleverAddress('klv1...')
 * ```
 */
export type KleverAddress = Brand<string, 'KleverAddress'>

/**
 * A branded type representing a valid transaction hash
 * Must be exactly 64 hexadecimal characters
 *
 * @example
 * ```typescript
 * const hash: TransactionHash = createTransactionHash('0123456789abcdef...')
 * ```
 */
export type TransactionHash = Brand<string, 'TransactionHash'>

/**
 * A branded type representing a asset amount in smallest units
 *
 * @example
 * ```typescript
 * const amount: AssetAmount = createAssetAmount(1000000n) // 1 KLV
 * ```
 */
export type AssetAmount = Brand<bigint, 'AssetAmount'>

export type AssetID = Brand<string, 'AssetID'>

// Block Height
export type BlockHeight = Brand<number, 'BlockHeight'>

// Block Hash
export type BlockHash = Brand<string, 'BlockHash'>

// Nonce
export type Nonce = Brand<number, 'Nonce'>

export type PublicKey = Brand<string, 'PublicKey'>
export type PrivateKey = Brand<string, 'PrivateKey'>
export type Signature = Brand<string, 'Signature'>

export type HexString = Brand<string, 'HexString'>
export type Base58String = Brand<string, 'Base58String'>

/**
 * Type guard to check if a string is a valid Klever address
 *
 * @param value - The string to check
 * @returns True if the string is a valid Klever address
 *
 * @example
 * ```typescript
 * if (isKleverAddress(input)) {
 *   // input is now typed as KleverAddress
 * }
 * ```
 */
export function isKleverAddress(value: string): value is KleverAddress {
  if (!value || typeof value !== 'string') return false
  // Klever addresses are bech32 encoded with 'klv1' prefix
  // They should be 62 characters total: 'klv1' (4) + 58 characters
  return /^klv1[a-z0-9]{58}$/.test(value)
}

const KLEVER_ADDRESS_PREFIX = 'klv'
const KLEVER_ADDRESS_LENGTH = 32

/**
 * Validates a Klever address using bech32 decoding
 *
 * This function performs full bech32 validation by decoding the address
 * and verifying both the prefix and data length. It's more thorough than
 * the regex-based `isKleverAddress()` function.
 *
 * @param address - The address string to validate
 * @returns True if the address is valid (correct prefix and data length)
 *
 * @example
 * ```typescript
 * if (isValidAddress('klv1qqqqqqqqqqqqqpgqxwklx...')) {
 *   console.log('Valid Klever address')
 * }
 * ```
 *
 * @see {@link isKleverAddress} for a faster regex-based validation
 */
export function isValidAddress(address: string): boolean {
  try {
    const { prefix, data } = bech32Decode(address)
    return prefix === KLEVER_ADDRESS_PREFIX && data.length === KLEVER_ADDRESS_LENGTH
  } catch {
    return false
  }
}

/**
 * Type guard to check if a string is a valid transaction hash
 *
 * @param value - The string to check
 * @returns True if the string is a valid transaction hash
 *
 * @example
 * ```typescript
 * if (isTransactionHash(input)) {
 *   // input is now typed as TransactionHash
 * }
 * ```
 */
export function isTransactionHash(value: string): value is TransactionHash {
  if (!value || typeof value !== 'string') return false
  return /^[0-9a-fA-F]{64}$/.test(value)
}

/**
 * Creates a KleverAddress from a string with validation
 *
 * @param value - The address string to validate and convert
 * @returns A validated KleverAddress
 * @throws {Error} If the address is invalid
 *
 * @example
 * ```typescript
 * const address = createKleverAddress('klv1qqqqqqqqqqqqqpgqxwklx...')
 * ```
 */
export function createKleverAddress(value: string): KleverAddress {
  if (!isKleverAddress(value)) {
    throw new Error(`Invalid Klever address: ${value}`)
  }
  return value
}

/**
 * Creates a TransactionHash from a string with validation
 *
 * @param value - The hash string to validate and convert
 * @returns A validated TransactionHash
 * @throws {Error} If the hash is invalid
 *
 * @example
 * ```typescript
 * const hash = createTransactionHash('1234567890abcdef...')
 * ```
 */
export function createTransactionHash(value: string): TransactionHash {
  if (!isTransactionHash(value)) {
    throw new Error(`Invalid transaction hash: ${value}`)
  }
  return value
}

/**
 * Creates a AssetAmount from various numeric types
 *
 * @param value - The amount as bigint, string, or number
 * @param _decimals - The number of decimals (currently unused)
 * @returns A validated AssetAmount
 * @throws {Error} If the amount is negative
 *
 * @example
 * ```typescript
 * const amount1 = createAssetAmount(1000000n) // From bigint
 * const amount2 = createAssetAmount('1000000') // From string
 * const amount3 = createAssetAmount(1000000) // From number
 * ```
 */
export function createAssetAmount(value: bigint | string | number, _decimals = 6): AssetAmount {
  const bigintValue = BigInt(value)
  if (bigintValue < 0n) {
    throw new Error('Asset amount cannot be negative')
  }
  return bigintValue as AssetAmount
}

/**
 * Formats a AssetAmount to a human-readable string
 *
 * @param amount - The asset amount in smallest units
 * @param decimals - The number of decimal places (default: 6 for KLV)
 * @returns A formatted string representation
 *
 * @example
 * ```typescript
 * formatAssetAmount(createAssetAmount(1000000n)) // '1'
 * formatAssetAmount(createAssetAmount(1500000n)) // '1.5'
 * formatAssetAmount(createAssetAmount(1234567n)) // '1.234567'
 * ```
 */
export function formatAssetAmount(amount: AssetAmount, decimals = 6): string {
  const value = BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  const whole = value / divisor
  const fraction = value % divisor

  if (fraction === 0n) {
    return whole.toString()
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${whole}.${fractionStr}`
}

/**
 * Parses a human-readable string to a AssetAmount
 *
 * @param value - The string to parse (e.g., '1.5')
 * @param decimals - The number of decimal places (default: 6 for KLV)
 * @returns A AssetAmount in smallest units
 *
 * @example
 * ```typescript
 * parseAssetAmount('1') // 1000000n (1 KLV)
 * parseAssetAmount('1.5') // 1500000n (1.5 KLV)
 * parseAssetAmount('0.000001') // 1n (0.000001 KLV)
 * ```
 */
export function parseAssetAmount(value: string, decimals = 6): AssetAmount {
  const [whole, fraction = ''] = value.split('.')
  const wholeBigInt = BigInt(whole || 0) * BigInt(10 ** decimals)
  const fractionBigInt = BigInt(fraction.padEnd(decimals, '0').slice(0, decimals))
  return createAssetAmount(wholeBigInt + fractionBigInt, decimals)
}
