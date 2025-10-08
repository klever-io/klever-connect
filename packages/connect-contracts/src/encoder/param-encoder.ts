/**
 * Parameter Encoder for Klever Smart Contracts
 *
 * Encodes parameters according to Klever's encoding rules:
 * - Fixed-size types: Big-endian, leading zeros trimmed (min 1 byte)
 * - Variable-length: Top-level (no prefix), Nested (4-byte length prefix)
 */

import { bech32Decode } from '@klever/connect-encoding'

/**
 * Encode unsigned integer (u8, u16, u32, u64)
 * Big-endian encoding with leading zeros trimmed (minimum 1 byte)
 */
export function encodeU8(value: number): Uint8Array {
  if (value < 0 || value > 255 || !Number.isInteger(value)) {
    throw new Error(`Invalid u8 value: ${value}`)
  }
  return value === 0 ? new Uint8Array([0]) : new Uint8Array([value])
}

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
 * true = 0x01, false = 0x00
 */
export function encodeBool(value: boolean): Uint8Array {
  return new Uint8Array([value ? 0x01 : 0x00])
}

/**
 * Encode address (bech32 → raw bytes)
 * Klever addresses are bech32-encoded, we need the raw 32 bytes
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
 * Encode string (UTF-8 bytes)
 * Top-level: raw bytes, no length prefix
 * Nested: 4-byte length prefix + bytes
 */
export function encodeString(value: string, nested = false): Uint8Array {
  const utf8Bytes = new TextEncoder().encode(value)

  if (nested) {
    return encodeBytesWithLength(utf8Bytes)
  }

  return utf8Bytes
}

/**
 * Encode bytes
 * Top-level: raw bytes, no length prefix
 * Nested: 4-byte length prefix + bytes
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
 * Convert bytes to hex string (for function call encoding)
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert hex string to bytes
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
