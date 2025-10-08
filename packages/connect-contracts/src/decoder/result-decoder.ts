/**
 * Result Decoder for Klever Smart Contracts
 *
 * Decodes return values from contract functions.
 * Flow: Base64 string → Bytes → Decode by ABI type
 */

import { bech32Encode } from '@klever/connect-encoding'
import type { DecodedResult } from '../types/contract'

/**
 * Decode unsigned integer (u8, u16, u32, u64)
 * Big-endian encoding
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
 * 0x01 = true, 0x00 = false
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
 * Decode address (32 raw bytes → bech32)
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
 * Decode string (UTF-8 bytes)
 * Nested strings have 4-byte length prefix
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
}
