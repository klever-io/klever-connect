/**
 * Result Decoder for Klever Smart Contracts
 *
 * Decodes return values from contract functions.
 * Flow: Base64 string → Bytes → Decode by ABI type
 *
 * @remarks
 * This module provides low-level decoding functions for individual parameter types.
 * For most use cases, prefer using ABIDecoder which handles decoding automatically
 * based on the contract ABI.
 *
 * Decoding rules:
 * - Integers: Big-endian bytes to number (u8, u16, u32) or bigint (u64)
 * - Boolean: 0x01 = true, 0x00 = false
 * - Address: 32 raw bytes encoded to bech32
 * - Strings: UTF-8 bytes to string (with optional 4-byte length prefix)
 * - Bytes: Raw bytes (with optional 4-byte length prefix)
 *
 * @example Using contractResult helper
 * ```typescript
 * import { contractResult } from '@klever/connect-contracts'
 *
 * // Decode base64 to bytes
 * const bytes = contractResult.fromBase64('AQ==')
 *
 * // Decode different types
 * const u32 = contractResult.u32(bytes)
 * const addr = contractResult.address(bytes)
 * const str = contractResult.string(bytes)
 *
 * // Convert hex to base64
 * const base64 = contractResult.hexToBase64('0f4240')
 * ```
 *
 * @example Using individual decoding functions
 * ```typescript
 * import { decodeU32, decodeAddress, decodeString } from '@klever/connect-contracts'
 *
 * const amount = decodeU32(bytes)
 * const sender = decodeAddress(bytes, 0)
 * const message = decodeString(bytes, 32)
 * ```
 */

import { bech32Encode } from '@klever/connect-encoding'
import type { DecodedResult } from '../types/contract'

/**
 * Decode unsigned 8-bit integer (u8)
 *
 * Decodes a single byte to a number (0-255).
 * Uses big-endian encoding.
 *
 * @param bytes - Bytes to decode
 * @param offset - Starting offset in bytes (default: 0)
 * @returns Decoded result with value, type, and bytes consumed
 * @throws Error if insufficient bytes
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([42])
 * const result = decodeU8(bytes)
 * console.log(result.value) // 42
 * console.log(result.type) // 'u8'
 * console.log(result.consumed) // 1
 * ```
 */
export function decodeU8(bytes: Uint8Array, offset = 0): DecodedResult {
  if (offset >= bytes.length) {
    throw new Error('Insufficient bytes to decode u8')
  }

  const value = bytes[offset]
  return {
    type: 'u8',
    value,
    consumed: 1,
  }
}

/**
 * Decode unsigned 16-bit integer (u16)
 *
 * Decodes 2 bytes to a number (0-65535).
 * Uses big-endian encoding.
 *
 * @param bytes - Bytes to decode
 * @param offset - Starting offset in bytes (default: 0)
 * @returns Decoded result with value, type, and bytes consumed
 * @throws Error if insufficient bytes
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([3, 232]) // 0x03E8 = 1000
 * const result = decodeU16(bytes)
 * console.log(result.value) // 1000
 * console.log(result.consumed) // 2
 * ```
 */
export function decodeU16(bytes: Uint8Array, offset = 0): DecodedResult {
  if (offset + 1 >= bytes.length) {
    throw new Error('Insufficient bytes to decode u16')
  }

  let value = 0
  for (let i = 0; i < 2; i++) {
    const byte = bytes[offset + i]
    if (byte === undefined) throw new Error('Invalid byte at offset')
    value = (value << 8) | byte
  }

  return {
    type: 'u16',
    value,
    consumed: 2,
  }
}

/**
 * Decode unsigned 32-bit integer (u32)
 *
 * Decodes 4 bytes to a number (0-4294967295).
 * Uses big-endian encoding.
 *
 * @param bytes - Bytes to decode
 * @param offset - Starting offset in bytes (default: 0)
 * @returns Decoded result with value, type, and bytes consumed
 * @throws Error if insufficient bytes
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([15, 66, 64]) // 0x0F4240 = 1000000
 * const result = decodeU32(bytes)
 * console.log(result.value) // 1000000
 * console.log(result.consumed) // 4
 * ```
 */
export function decodeU32(bytes: Uint8Array, offset = 0): DecodedResult {
  if (offset + 3 >= bytes.length) {
    throw new Error('Insufficient bytes to decode u32')
  }

  let value = 0
  for (let i = 0; i < 4; i++) {
    const byte = bytes[offset + i]
    if (byte === undefined) throw new Error('Invalid byte at offset')
    value = (value << 8) | byte
  }

  return {
    type: 'u32',
    value: value >>> 0, // Ensure unsigned
    consumed: 4,
  }
}

/**
 * Decode unsigned 64-bit integer (u64)
 *
 * Decodes 8 bytes to a bigint (0 to 2^64-1).
 * Uses big-endian encoding.
 *
 * @param bytes - Bytes to decode
 * @param offset - Starting offset in bytes (default: 0)
 * @returns Decoded result with bigint value, type, and bytes consumed
 * @throws Error if insufficient bytes
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([59, 154, 202, 0, 0, 0, 0, 0])
 * const result = decodeU64(bytes)
 * console.log(result.value) // 1000000000n
 * console.log(result.type) // 'u64'
 * console.log(result.consumed) // 8
 * ```
 */
export function decodeU64(bytes: Uint8Array, offset = 0): DecodedResult {
  if (offset + 7 >= bytes.length) {
    throw new Error('Insufficient bytes to decode u64')
  }

  let value = 0n
  for (let i = 0; i < 8; i++) {
    const byte = bytes[offset + i]
    if (byte === undefined) throw new Error('Invalid byte at offset')
    value = (value << 8n) | BigInt(byte)
  }

  return {
    type: 'u64',
    value,
    consumed: 8,
  }
}

/**
 * Decode boolean
 *
 * Decodes a single byte to a boolean value.
 * - 0x01 = true
 * - 0x00 = false
 *
 * @param bytes - Bytes to decode
 * @param offset - Starting offset in bytes (default: 0)
 * @returns Decoded result with boolean value, type, and bytes consumed
 * @throws Error if insufficient bytes
 *
 * @example
 * ```typescript
 * const trueBytes = new Uint8Array([1])
 * const result1 = decodeBool(trueBytes)
 * console.log(result1.value) // true
 *
 * const falseBytes = new Uint8Array([0])
 * const result2 = decodeBool(falseBytes)
 * console.log(result2.value) // false
 * ```
 */
export function decodeBool(bytes: Uint8Array, offset = 0): DecodedResult {
  if (offset >= bytes.length) {
    throw new Error('Insufficient bytes to decode bool')
  }

  const value = bytes[offset] === 0x01

  return {
    type: 'bool',
    value,
    consumed: 1,
  }
}

/**
 * Decode Klever address
 *
 * Decodes 32 raw bytes to a bech32-formatted Klever address (klv1...).
 *
 * @param bytes - Bytes to decode (must have at least 32 bytes from offset)
 * @param offset - Starting offset in bytes (default: 0)
 * @returns Decoded result with bech32 address string, type, and bytes consumed
 * @throws Error if insufficient bytes (needs 32 bytes)
 *
 * @example
 * ```typescript
 * // Assume bytes contains 32-byte raw address
 * const result = decodeAddress(addressBytes)
 * console.log(result.value) // 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
 * console.log(result.type) // 'Address'
 * console.log(result.consumed) // 32
 * ```
 */
export function decodeAddress(bytes: Uint8Array, offset = 0): DecodedResult {
  if (offset + 31 >= bytes.length) {
    throw new Error('Insufficient bytes to decode address')
  }

  const addressBytes = bytes.slice(offset, offset + 32)

  // Encode to bech32
  const address = encodeBech32(addressBytes)

  return {
    type: 'Address',
    value: address,
    consumed: 32,
  }
}

/**
 * Decode UTF-8 string
 *
 * Decodes UTF-8 bytes to a string. The format depends on context:
 * - Top-level: Raw bytes to end of array
 * - Nested (with length prefix): 4-byte big-endian length + UTF-8 bytes
 *
 * @param bytes - Bytes to decode
 * @param offset - Starting offset in bytes (default: 0)
 * @param hasLengthPrefix - Whether to read 4-byte length prefix (default: false)
 * @returns Decoded result with string value, type, and bytes consumed
 * @throws Error if insufficient bytes
 *
 * @example Top-level decoding
 * ```typescript
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
 * const result = decodeString(bytes, 0, false)
 * console.log(result.value) // 'Hello'
 * console.log(result.consumed) // 5
 * ```
 *
 * @example Nested decoding with length prefix
 * ```typescript
 * const bytes = new Uint8Array([0, 0, 0, 2, 72, 105]) // length=2, "Hi"
 * const result = decodeString(bytes, 0, true)
 * console.log(result.value) // 'Hi'
 * console.log(result.consumed) // 6 (4 bytes length + 2 bytes data)
 * ```
 */
export function decodeString(
  bytes: Uint8Array,
  offset = 0,
  hasLengthPrefix = false,
): DecodedResult {
  let dataOffset = offset
  let length: number

  if (hasLengthPrefix) {
    // Read 4-byte length prefix
    if (offset + 3 >= bytes.length) {
      throw new Error('Insufficient bytes to decode string length')
    }

    length = 0
    for (let i = 0; i < 4; i++) {
      const byte = bytes[offset + i]
      if (byte === undefined) throw new Error('Invalid byte at offset')
      length = (length << 8) | byte
    }
    dataOffset = offset + 4
  } else {
    // No length prefix, read until end
    length = bytes.length - offset
  }

  if (dataOffset + length > bytes.length) {
    throw new Error('Insufficient bytes to decode string data')
  }

  const stringBytes = bytes.slice(dataOffset, dataOffset + length)
  const value = new TextDecoder().decode(stringBytes)

  return {
    type: 'string',
    value,
    consumed: hasLengthPrefix ? 4 + length : length,
  }
}

/**
 * Decode bytes
 * Nested bytes have 4-byte length prefix
 */
export function decodeBytes(bytes: Uint8Array, offset = 0, hasLengthPrefix = false): DecodedResult {
  let dataOffset = offset
  let length: number

  if (hasLengthPrefix) {
    // Read 4-byte length prefix
    if (offset + 3 >= bytes.length) {
      throw new Error('Insufficient bytes to decode bytes length')
    }

    length = 0
    for (let i = 0; i < 4; i++) {
      const byte = bytes[offset + i]
      if (byte === undefined) throw new Error('Invalid byte at offset')
      length = (length << 8) | byte
    }
    dataOffset = offset + 4
  } else {
    // No length prefix, read until end
    length = bytes.length - offset
  }

  if (dataOffset + length > bytes.length) {
    throw new Error('Insufficient bytes to decode bytes data')
  }

  const value = bytes.slice(dataOffset, dataOffset + length)

  return {
    type: 'bytes',
    value,
    consumed: hasLengthPrefix ? 4 + length : length,
  }
}

/**
 * Decode base64 string to bytes
 *
 * Decodes a base64-encoded string to a Uint8Array.
 * Works in both browser and Node.js environments.
 *
 * @param base64 - Base64-encoded string
 * @returns Decoded bytes
 *
 * @example
 * ```typescript
 * const base64 = 'SGVsbG8=' // "Hello" in base64
 * const bytes = decodeBase64(base64)
 * console.log(bytes) // Uint8Array([72, 101, 108, 108, 111])
 *
 * const text = new TextDecoder().decode(bytes)
 * console.log(text) // 'Hello'
 * ```
 *
 * @example Decoding contract return data
 * ```typescript
 * // Contract returns base64-encoded data
 * const returnData = ['AQ==', 'BQ=='] // [1, 5]
 *
 * const bytes1 = decodeBase64(returnData[0])
 * const bytes2 = decodeBase64(returnData[1])
 *
 * console.log(bytes1) // Uint8Array([1])
 * console.log(bytes2) // Uint8Array([5])
 * ```
 */
export function decodeBase64(base64: string): Uint8Array {
  // Use native atob in browser, Buffer in Node
  if (typeof globalThis !== 'undefined' && 'atob' in globalThis) {
    const atob = (globalThis as typeof globalThis & { atob: (str: string) => string }).atob
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  } else {
    // Node.js environment
    return new Uint8Array(Buffer.from(base64, 'base64'))
  }
}

/**
 * Encode bytes to base64
 *
 * Encodes a Uint8Array to a base64 string.
 * Works in both browser and Node.js environments.
 *
 * @param bytes - Bytes to encode
 * @returns Base64-encoded string
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
 * const base64 = encodeBase64(bytes)
 * console.log(base64) // 'SGVsbG8='
 * ```
 *
 * @example Encoding for API requests
 * ```typescript
 * const data = new Uint8Array([1, 2, 3, 4])
 * const encoded = encodeBase64(data)
 *
 * // Use in API request
 * const response = await provider.queryContract({
 *   ScAddress: contractAddress,
 *   FuncName: 'processData',
 *   Arguments: [encoded]
 * })
 * ```
 */
export function encodeBase64(bytes: Uint8Array): string {
  if (typeof globalThis !== 'undefined' && 'btoa' in globalThis) {
    const btoa = (globalThis as typeof globalThis & { btoa: (str: string) => string }).btoa
    const binaryString = Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join('')
    return btoa(binaryString)
  } else {
    // Node.js environment
    return Buffer.from(bytes).toString('base64')
  }
}

function encodeBech32(data: Uint8Array): string {
  return bech32Encode(data)
}

/**
 * Convert hex string to base64
 * Useful for converting event data (hex) to decoder format (base64)
 */
export function hexToBase64(hex: string): string {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex

  // Convert hex to bytes
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.slice(i, i + 2), 16)
    bytes[i / 2] = byte
  }

  // Convert bytes to base64
  return encodeBase64(bytes)
}

/**
 * Helper object for manual decoding (exposed to developers)
 */
export const contractResult = {
  u8: decodeU8,
  u16: decodeU16,
  u32: decodeU32,
  u64: decodeU64,
  bool: decodeBool,
  address: decodeAddress,
  string: decodeString,
  bytes: decodeBytes,
  fromBase64: decodeBase64,
  toBase64: encodeBase64,
  hexToBase64: hexToBase64,
}
