/**
 * ABI-Aware Result Decoder
 *
 * Automatically decodes results based on ABI type definitions.
 */

import type { ContractABI, ABIParameter, ABITypeDefinition } from '../types/abi'
import { ABIParser } from '../abi/parser'
import { decodeAddress, decodeString, decodeBytes, decodeBase64 } from './result-decoder'

/**
 * Decoded value with metadata
 */
export interface DecodedValue {
  value: unknown
  type: string
  consumed: number
}

/**
 * Decode variable-length integer (top-level or nested)
 */
function decodeVariableInt(
  bytes: Uint8Array,
  offset: number,
  nested: boolean,
  fixedBytes: number,
): { value: number | bigint; consumed: number } {
  let dataOffset = offset
  let length: number

  if (nested) {
    // Nested: fixed size, no length prefix
    length = fixedBytes
    dataOffset = offset
  } else {
    // Top-level: use remaining bytes (trimmed leading zeros)
    length = bytes.length - offset
  }

  if (dataOffset + length > bytes.length) {
    throw new Error('Insufficient bytes to decode integer data')
  }

  // Decode big-endian bytes
  if (fixedBytes <= 4) {
    // u8, u16, u32 - return number
    let value = 0
    for (let i = 0; i < length; i++) {
      const byte = bytes[dataOffset + i]
      if (byte === undefined) throw new Error('Invalid byte at offset')
      value = (value << 8) | byte
    }
    return {
      value: value >>> 0, // Ensure unsigned
      consumed: length,
    }
  } else {
    // u64 - return bigint
    let value = 0n
    for (let i = 0; i < length; i++) {
      const byte = bytes[dataOffset + i]
      if (byte === undefined) throw new Error('Invalid byte at offset')
      value = (value << 8n) | BigInt(byte)
    }
    return {
      value,
      consumed: length,
    }
  }
}

/**
 * Decode a value based on its ABI type
 */
export function decodeByType(
  bytes: Uint8Array,
  type: string,
  abi: ContractABI,
  offset = 0,
  nested = false,
): DecodedValue {
  // Handle primitive types with variable-length encoding
  if (type === 'u8') {
    const result = decodeVariableInt(bytes, offset, nested, 1)
    return { value: result.value as number, type: 'u8', consumed: result.consumed }
  }
  if (type === 'u16') {
    const result = decodeVariableInt(bytes, offset, nested, 2)
    return { value: result.value as number, type: 'u16', consumed: result.consumed }
  }
  if (type === 'u32') {
    const result = decodeVariableInt(bytes, offset, nested, 4)
    return { value: result.value as number, type: 'u32', consumed: result.consumed }
  }
  if (type === 'u64') {
    const result = decodeVariableInt(bytes, offset, nested, 8)
    return { value: result.value, type: 'u64', consumed: result.consumed }
  }
  if (type === 'bool') {
    // Bool is always 1 byte (no length prefix even when nested)
    if (offset >= bytes.length) {
      throw new Error('Insufficient bytes to decode bool')
    }
    const value = bytes[offset] === 0x01
    return { value, type: 'bool', consumed: 1 }
  }
  if (type === 'Address') {
    const result = decodeAddress(bytes, offset)
    return { value: result.value, type: 'Address', consumed: result.consumed || 32 }
  }

  // Handle variable-length types
  if (type === 'bytes') {
    const result = decodeBytes(bytes, offset, nested)
    return { value: result.value, type: 'bytes', consumed: result.consumed || bytes.length }
  }

  // Handle strings
  if (type.startsWith('utf-8 string') || type === 'TokenIdentifier' || type === 'KdaTokenType') {
    const result = decodeString(bytes, offset, nested)
    return { value: result.value, type: 'string', consumed: result.consumed || bytes.length }
  }

  // Handle BigUint/BigInt
  if (type === 'BigUint' || type === 'BigInt') {
    return decodeBigUint(bytes, offset, nested)
  }

  // Handle custom types
  if (abi.types[type]) {
    const typeDef = ABIParser.getType(abi, type)

    if (typeDef.type === 'struct') {
      return decodeStruct(bytes, typeDef, abi, offset)
    }

    if (typeDef.type === 'enum') {
      return decodeEnum(bytes, typeDef, offset, nested)
    }
  }

  // Handle Option<T>
  if (type.startsWith('Option<')) {
    const innerType = type.slice(7, -1)
    const discriminant = bytes[offset]

    if (discriminant === 0 || discriminant === undefined) {
      return { value: null, type: 'Option', consumed: 1 }
    }

    const inner = decodeByType(bytes, innerType, abi, offset + 1, true)
    return { value: inner.value, type: 'Option', consumed: 1 + inner.consumed }
  }

  // Handle List<T> / Vec<T>
  if (type.startsWith('List<') || type.startsWith('Vec<')) {
    const innerType = type.slice(type.indexOf('<') + 1, -1)
    return decodeList(bytes, innerType, abi, offset)
  }

  throw new Error(`Unsupported type for decoding: ${type}`)
}

/**
 * Decode BigUint/BigInt
 */
function decodeBigUint(bytes: Uint8Array, offset: number, nested: boolean): DecodedValue {
  let dataOffset = offset
  let length: number

  if (nested) {
    // Read 4-byte length prefix
    if (offset + 3 >= bytes.length) {
      throw new Error('Insufficient bytes to decode BigUint length')
    }

    length = 0
    for (let i = 0; i < 4; i++) {
      const byte = bytes[offset + i]
      if (byte === undefined) throw new Error('Invalid byte at offset')
      length = (length << 8) | byte
    }
    dataOffset = offset + 4
  } else {
    length = bytes.length - offset
  }

  if (dataOffset + length > bytes.length) {
    throw new Error('Insufficient bytes to decode BigUint data')
  }

  // Convert from big-endian bytes to bigint
  let value = 0n
  for (let i = 0; i < length; i++) {
    const byte = bytes[dataOffset + i]
    if (byte === undefined) throw new Error('Invalid byte at offset')
    value = (value << 8n) | BigInt(byte)
  }

  return {
    value,
    type: 'BigUint',
    consumed: nested ? 4 + length : length,
  }
}

/**
 * Decode struct based on ABI definition
 */
function decodeStruct(
  bytes: Uint8Array,
  typeDef: ABITypeDefinition,
  abi: ContractABI,
  offset: number,
): DecodedValue {
  if (!typeDef.fields) {
    throw new Error('Struct type definition missing fields')
  }

  const result: Record<string, unknown> = {}
  let currentOffset = offset

  for (const field of typeDef.fields) {
    // Decode field (nested = true for struct fields, they have length prefixes)
    const decoded = decodeByType(bytes, field.type, abi, currentOffset, true)
    result[field.name] = decoded.value
    currentOffset += decoded.consumed
  }

  return {
    value: result,
    type: 'struct',
    consumed: currentOffset - offset,
  }
}

/**
 * Decode enum variant
 */
function decodeEnum(
  bytes: Uint8Array,
  typeDef: ABITypeDefinition,
  offset: number,
  _nested: boolean,
): DecodedValue {
  if (!typeDef.variants) {
    throw new Error('Enum type definition missing variants')
  }

  // Enum is always 1 byte discriminant (no length prefix even when nested)
  if (offset >= bytes.length) {
    throw new Error('Insufficient bytes to decode enum')
  }

  const discriminant = bytes[offset]
  if (discriminant === undefined) {
    throw new Error('Insufficient bytes to decode enum')
  }

  // Find variant by discriminant
  const variant = typeDef.variants.find((v) => v.discriminant === discriminant)
  if (!variant) {
    throw new Error(`Unknown enum variant discriminant: ${discriminant}`)
  }

  // Return just the discriminant for simpler usage
  // (matches encoding pattern where you can pass either discriminant or name)
  return {
    value: discriminant,
    type: 'enum',
    consumed: 1,
  }
}

/**
 * Decode list/array
 */
function decodeList(
  bytes: Uint8Array,
  innerType: string,
  abi: ContractABI,
  offset: number,
): DecodedValue {
  // Decode count as fixed 4-byte u32 (always nested encoding)
  const countResult = decodeVariableInt(bytes, offset, true, 4)
  const count = countResult.value as number
  let currentOffset = offset + countResult.consumed

  const items: unknown[] = []

  // Decode each item (nested = true)
  for (let i = 0; i < count; i++) {
    const decoded = decodeByType(bytes, innerType, abi, currentOffset, true)
    items.push(decoded.value)
    currentOffset += decoded.consumed
  }

  return {
    value: items,
    type: 'List',
    consumed: currentOffset - offset,
  }
}

/**
 * Decode function results based on ABI
 */
export function decodeResults(
  data: Uint8Array[] | string[],
  params: ABIParameter[],
  abi: ContractABI,
): unknown[] {
  if (data.length !== params.length) {
    throw new Error(`Expected ${params.length} return values, got ${data.length}`)
  }

  try {
    return data.map((item, index) => {
      const param = params[index]
      if (!param) {
        throw new Error(`Parameter at index ${index} not found`)
      }

      // Convert base64 to bytes if needed
      const bytes = typeof item === 'string' ? decodeBase64(item) : item

      // Decode based on type (top-level: nested = false)
      const decoded = decodeByType(bytes, param.type, abi, 0, false)

      return decoded.value
    })
  } catch (err) {
    return data.map((item) => {
      // decode to bytes if string
      const valueBytes = typeof item === 'string' ? decodeBase64(item) : item
      // encode Uint8Array to hex for easier debugging
      return Buffer.from(valueBytes).toString('hex')
    })
  }
}

/**
 * ABI-aware decoder class
 */
export class ABIDecoder {
  constructor(private abi: ContractABI) {}

  /**
   * Decode function results
   */
  decodeFunctionResults(functionName: string, data: Uint8Array[] | string[]): unknown[] {
    const endpoint = ABIParser.getEndpoint(this.abi, functionName)
    return decodeResults(data, endpoint.outputs, this.abi)
  }

  /**
   * Decode constructor results (if any)
   */
  decodeConstructorResults(data: Uint8Array[] | string[]): unknown[] {
    return decodeResults(data, this.abi.constructor.outputs, this.abi)
  }

  /**
   * Decode single value by type
   */
  decodeValue(bytes: Uint8Array, type: string): unknown {
    const decoded = decodeByType(bytes, type, this.abi, 0, false)
    return decoded.value
  }
}
