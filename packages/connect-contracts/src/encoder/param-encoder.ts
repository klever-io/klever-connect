/**
 * Parameter Encoder for Klever Smart Contracts
 *
 * Encodes parameters according to Klever's encoding rules:
 * - Fixed-size types: Big-endian, leading zeros trimmed (min 1 byte)
 * - Variable-length: Top-level (no prefix), Nested (4-byte length prefix)
 *
 * @remarks
 * This module provides low-level encoding functions for individual parameter types.
 * For most use cases, prefer using ABIEncoder which handles encoding automatically
 * based on the contract ABI.
 *
 * Encoding rules:
 * - Integers (u8, u16, u32, u64): Big-endian encoding with leading zeros trimmed
 * - Boolean: 0x01 for true, 0x00 for false
 * - Address: Bech32 decoded to 32 raw bytes
 * - Strings: UTF-8 bytes (4-byte length prefix when nested)
 * - Bytes: Raw bytes (4-byte length prefix when nested)
 *
 * @example Manual parameter encoding
 * ```typescript
 * import { contractParam } from '@klever/connect-contracts'
 *
 * // Encode different types
 * const u32 = contractParam.u32(100)
 * const addr = contractParam.address('klv1...')
 * const str = contractParam.string('Hello')
 * const bool = contractParam.bool(true)
 *
 * // Convert to hex
 * const hex = contractParam.toHex(u32)
 * ```
 *
 * @example Using individual encoding functions
 * ```typescript
 * import { encodeU32, encodeAddress, encodeString } from '@klever/connect-contracts'
 *
 * const amount = encodeU32(1000)
 * const recipient = encodeAddress('klv1receiver...')
 * const message = encodeString('Transfer successful')
 * ```
 */

import { bech32Decode } from '@klever/connect-encoding'

/**
 * Encode unsigned 8-bit integer (u8)
 *
 * Encodes a number (0-255) to a Uint8Array using big-endian encoding.
 * Leading zeros are trimmed, with a minimum of 1 byte.
 *
 * @param value - Number between 0 and 255
 * @returns Encoded bytes (always 1 byte for u8)
 * @throws Error if value is out of range or not an integer
 *
 * @example
 * ```typescript
 * const encoded = encodeU8(42)
 * console.log(encoded) // Uint8Array([42])
 *
 * const zero = encodeU8(0)
 * console.log(zero) // Uint8Array([0])
 *
 * const max = encodeU8(255)
 * console.log(max) // Uint8Array([255])
 * ```
 */
export function encodeU8(value: number): Uint8Array {
  if (value < 0 || value > 255 || !Number.isInteger(value)) {
    throw new Error(`Invalid u8 value: ${value}`)
  }
  return value === 0 ? new Uint8Array([0]) : new Uint8Array([value])
}

/**
 * Encode unsigned 16-bit integer (u16)
 *
 * Encodes a number (0-65535) to a Uint8Array using big-endian encoding.
 * Leading zeros are trimmed, resulting in 1-2 bytes.
 *
 * @param value - Number between 0 and 65535
 * @returns Encoded bytes (1-2 bytes)
 * @throws Error if value is out of range or not an integer
 *
 * @example
 * ```typescript
 * const encoded = encodeU16(1000)
 * console.log(encoded) // Uint8Array([3, 232]) = 0x03E8
 *
 * const max = encodeU16(65535)
 * console.log(max) // Uint8Array([255, 255])
 * ```
 */
export function encodeU16(value: number): Uint8Array {
  if (value < 0 || value > 65535 || !Number.isInteger(value)) {
    throw new Error(`Invalid u16 value: ${value}`)
  }
  if (value === 0) return new Uint8Array([0])

  const bytes: number[] = []
  let temp = value
  while (temp > 0) {
    bytes.unshift(temp & 0xff)
    temp >>= 8
  }
  return new Uint8Array(bytes)
}

/**
 * Encode unsigned 32-bit integer (u32)
 *
 * Encodes a number (0-4294967295) to a Uint8Array using big-endian encoding.
 * Leading zeros are trimmed, resulting in 1-4 bytes.
 *
 * @param value - Number between 0 and 4294967295
 * @returns Encoded bytes (1-4 bytes)
 * @throws Error if value is out of range or not an integer
 *
 * @example
 * ```typescript
 * const encoded = encodeU32(1000000)
 * console.log(encoded) // Uint8Array([15, 66, 64]) = 0x0F4240
 *
 * const max = encodeU32(4294967295)
 * console.log(max) // Uint8Array([255, 255, 255, 255])
 * ```
 */
export function encodeU32(value: number): Uint8Array {
  if (value < 0 || value > 0xffffffff || !Number.isInteger(value)) {
    throw new Error(`Invalid u32 value: ${value}`)
  }
  if (value === 0) return new Uint8Array([0])

  const bytes: number[] = []
  let temp = value
  while (temp > 0) {
    bytes.unshift(temp & 0xff)
    temp >>>= 8
  }
  return new Uint8Array(bytes)
}

/**
 * Encode unsigned 64-bit integer (u64)
 *
 * Encodes a bigint (0 to 2^64-1) to a Uint8Array using big-endian encoding.
 * Leading zeros are trimmed, resulting in 1-8 bytes.
 *
 * @param value - BigInt between 0n and 18446744073709551615n
 * @returns Encoded bytes (1-8 bytes)
 * @throws Error if value is out of range
 *
 * @example
 * ```typescript
 * const encoded = encodeU64(1000000000n)
 * console.log(encoded) // Uint8Array([59, 154, 202, 0])
 *
 * const large = encodeU64(9007199254740991n) // MAX_SAFE_INTEGER
 * console.log(large) // Uint8Array([31, 255, 255, 255, 255, 255, 255])
 * ```
 */
export function encodeU64(value: bigint): Uint8Array {
  if (value < 0n) {
    throw new Error(`Invalid u64 value: ${value} (must be non-negative)`)
  }
  if (value > 0xffffffffffffffffn) {
    throw new Error(`Invalid u64 value: ${value} (exceeds u64 max)`)
  }
  if (value === 0n) return new Uint8Array([0])

  const bytes: number[] = []
  let temp = value
  while (temp > 0n) {
    bytes.unshift(Number(temp & 0xffn))
    temp >>= 8n
  }
  return new Uint8Array(bytes)
}

/**
 * Encode boolean
 *
 * Encodes a boolean value to a Uint8Array.
 * - true = 0x01
 * - false = 0x00
 *
 * @param value - Boolean value to encode
 * @returns Encoded bytes (always 1 byte)
 *
 * @example
 * ```typescript
 * const trueValue = encodeBool(true)
 * console.log(trueValue) // Uint8Array([1])
 *
 * const falseValue = encodeBool(false)
 * console.log(falseValue) // Uint8Array([0])
 * ```
 */
export function encodeBool(value: boolean): Uint8Array {
  return new Uint8Array([value ? 0x01 : 0x00])
}

/**
 * Encode Klever address
 *
 * Encodes a bech32-formatted Klever address (klv1...) to raw 32 bytes.
 * The address is decoded from bech32 format to extract the underlying bytes.
 *
 * @param address - Bech32-encoded Klever address starting with 'klv1'
 * @returns Encoded bytes (always 32 bytes)
 * @throws Error if address format is invalid or doesn't decode to 32 bytes
 *
 * @example
 * ```typescript
 * const address = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
 * const encoded = encodeAddress(address)
 * console.log(encoded.length) // 32
 * console.log(encoded) // Uint8Array([...32 bytes...])
 * ```
 */
export function encodeAddress(address: string): Uint8Array {
  if (!address.startsWith('klv1')) {
    throw new Error(`Invalid Klever address: ${address}`)
  }

  // Decode bech32 to get raw bytes
  const decoded = decodeBech32(address)

  if (decoded.length !== 32) {
    throw new Error(`Invalid address length: expected 32 bytes, got ${decoded.length}`)
  }

  return decoded
}

/**
 * Encode UTF-8 string
 *
 * Encodes a string to UTF-8 bytes. The encoding format depends on context:
 * - Top-level arguments: Raw bytes, no length prefix
 * - Nested (struct fields, list items): 4-byte big-endian length prefix + bytes
 *
 * @param value - String to encode
 * @param nested - Whether this is a nested value (default: false)
 * @returns Encoded bytes
 *
 * @example Top-level encoding
 * ```typescript
 * const encoded = encodeString('Hello', false)
 * console.log(encoded) // Uint8Array([72, 101, 108, 108, 111])
 * // No length prefix for top-level
 * ```
 *
 * @example Nested encoding
 * ```typescript
 * const encoded = encodeString('Hi', true)
 * console.log(encoded)
 * // Uint8Array([0, 0, 0, 2, 72, 105])
 * //             [length=2][H][i]
 * ```
 */
export function encodeString(value: string, nested = false): Uint8Array {
  const utf8Bytes = new TextEncoder().encode(value)

  if (nested) {
    return encodeBytesWithLength(utf8Bytes)
  }

  return utf8Bytes
}

/**
 * Encode raw bytes
 *
 * Encodes a Uint8Array. The encoding format depends on context:
 * - Top-level arguments: Raw bytes, no length prefix
 * - Nested (struct fields, list items): 4-byte big-endian length prefix + bytes
 *
 * @param value - Bytes to encode
 * @param nested - Whether this is a nested value (default: false)
 * @returns Encoded bytes
 *
 * @example Top-level encoding
 * ```typescript
 * const bytes = new Uint8Array([1, 2, 3, 4])
 * const encoded = encodeBytes(bytes, false)
 * console.log(encoded) // Uint8Array([1, 2, 3, 4])
 * // No length prefix for top-level
 * ```
 *
 * @example Nested encoding
 * ```typescript
 * const bytes = new Uint8Array([255, 0])
 * const encoded = encodeBytes(bytes, true)
 * console.log(encoded)
 * // Uint8Array([0, 0, 0, 2, 255, 0])
 * //             [length=2][data]
 * ```
 */
export function encodeBytes(value: Uint8Array, nested = false): Uint8Array {
  if (nested) {
    return encodeBytesWithLength(value)
  }

  return value
}

/**
 * Encode bytes with 4-byte length prefix (for nested values)
 */
function encodeBytesWithLength(bytes: Uint8Array): Uint8Array {
  const length = bytes.length
  const lengthBytes = new Uint8Array(4)
  lengthBytes[0] = (length >> 24) & 0xff
  lengthBytes[1] = (length >> 16) & 0xff
  lengthBytes[2] = (length >> 8) & 0xff
  lengthBytes[3] = length & 0xff

  const result = new Uint8Array(4 + bytes.length)
  result.set(lengthBytes, 0)
  result.set(bytes, 4)
  return result
}

/**
 * Convert bytes to hex string
 *
 * Converts a Uint8Array to a lowercase hexadecimal string without '0x' prefix.
 * Used for function call encoding in the format: functionName@param1@param2
 *
 * @param bytes - Bytes to convert
 * @returns Hex string (lowercase, no '0x' prefix)
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([15, 66, 64])
 * const hex = bytesToHex(bytes)
 * console.log(hex) // '0f4240'
 *
 * const empty = bytesToHex(new Uint8Array([]))
 * console.log(empty) // ''
 * ```
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert hex string to bytes
 *
 * Converts a hexadecimal string to a Uint8Array.
 * Accepts strings with or without '0x' prefix.
 *
 * @param hex - Hex string (with or without '0x' prefix)
 * @returns Decoded bytes
 * @throws Error if hex string has odd length
 *
 * @example
 * ```typescript
 * const bytes1 = hexToBytes('0f4240')
 * console.log(bytes1) // Uint8Array([15, 66, 64])
 *
 * const bytes2 = hexToBytes('0x0f4240')
 * console.log(bytes2) // Uint8Array([15, 66, 64])
 *
 * const empty = hexToBytes('')
 * console.log(empty) // Uint8Array([])
 * ```
 */
export function hexToBytes(hex: string): Uint8Array {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex

  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have even length')
  }

  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16)
  }

  return bytes
}

function decodeBech32(address: string): Uint8Array {
  const result = bech32Decode(address)
  return result.data
}

/**
 * Helper object for manual encoding (exposed to developers)
 */
export const contractParam = {
  u8: encodeU8,
  u16: encodeU16,
  u32: encodeU32,
  u64: encodeU64,
  bool: encodeBool,
  address: encodeAddress,
  string: encodeString,
  bytes: encodeBytes,
  toHex: bytesToHex,
  fromHex: hexToBytes,
}
