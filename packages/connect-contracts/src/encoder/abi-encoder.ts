/**
 * ABI-Aware Parameter Encoder
 *
 * Automatically encodes parameters based on ABI type definitions.
 */

import type { ContractABI, ABIParameter, ABITypeDefinition } from '../types/abi'
import { ABIParser } from '../abi/parser'
import {
  encodeU8,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeBool,
  encodeAddress,
  encodeString,
  encodeBytes,
} from './param-encoder'

/**
 * Convert value to number, handling string inputs
 */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = Number(value)
    if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`)
    return num
  }
  throw new Error(`Cannot convert ${typeof value} to number`)
}

/**
 * Convert value to bigint, handling string and number inputs
 */
function toBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  if (typeof value === 'string') return BigInt(value)
  throw new Error(`Cannot convert ${typeof value} to bigint`)
}

/**
 * Encode integer as fixed-size big-endian (for nested encoding)
 */
function encodeFixedInt(value: number | bigint, byteSize: number): Uint8Array {
  const result = new Uint8Array(byteSize)

  if (typeof value === 'bigint') {
    for (let i = 0; i < byteSize; i++) {
      result[byteSize - 1 - i] = Number((value >> BigInt(i * 8)) & 0xffn)
    }
  } else {
    for (let i = 0; i < byteSize; i++) {
      result[byteSize - 1 - i] = (value >> (i * 8)) & 0xff
    }
  }

  return result
}

/**
 * Encode a value based on its ABI type
 */
export function encodeByType(
  value: unknown,
  type: string,
  abi: ContractABI,
  nested = false,
): Uint8Array {
  // Handle primitive types
  if (type === 'u8') {
    const numValue = toNumber(value)
    if (nested) {
      // Nested: fixed 1 byte, no length prefix
      return encodeFixedInt(numValue, 1)
    }
    return encodeU8(numValue)
  }
  if (type === 'u16') {
    const numValue = toNumber(value)
    if (nested) {
      // Nested: fixed 2 bytes, no length prefix
      return encodeFixedInt(numValue, 2)
    }
    return encodeU16(numValue)
  }
  if (type === 'u32') {
    const numValue = toNumber(value)
    if (nested) {
      // Nested: fixed 4 bytes, no length prefix
      return encodeFixedInt(numValue, 4)
    }
    return encodeU32(numValue)
  }
  if (type === 'u64') {
    const bigintValue = toBigInt(value)
    if (nested) {
      // Nested: fixed 8 bytes, no length prefix
      return encodeFixedInt(bigintValue, 8)
    }
    return encodeU64(bigintValue)
  }
  if (type === 'bool') {
    // Bool is always 1 byte (no length prefix even when nested)
    return encodeBool(value as boolean)
  }
  if (type === 'Address') {
    return encodeAddress(value as string)
  }

  // Handle variable-length types
  if (type === 'bytes') {
    return encodeBytes(value as Uint8Array, nested)
  }

  // Handle strings (TokenIdentifier, etc.)
  if (type.startsWith('utf-8 string') || type === 'TokenIdentifier' || type === 'KdaTokenType') {
    return encodeString(value as string, nested)
  }

  // Handle BigUint/BigInt
  if (type === 'BigUint' || type === 'BigInt') {
    // Encode as variable-length big-endian
    const bigintValue = toBigInt(value)
    return encodeBigUint(bigintValue, nested)
  }

  // Handle custom types (structs, enums)
  if (ABIParser.prototype.constructor && abi.types[type]) {
    const typeDef = ABIParser.getType(abi, type)

    if (typeDef.type === 'struct') {
      return encodeStruct(value as Record<string, unknown>, typeDef, abi)
    }

    if (typeDef.type === 'enum') {
      return encodeEnum(value as number | string, typeDef, nested)
    }
  }

  // Handle Option<T>
  if (type.startsWith('Option<')) {
    const innerType = type.slice(7, -1)
    if (value === null || value === undefined) {
      return new Uint8Array([0]) // None
    }
    const encoded = encodeByType(value, innerType, abi, true)
    const result = new Uint8Array(1 + encoded.length)
    result[0] = 1 // Some
    result.set(encoded, 1)
    return result
  }

  // Handle List<T> / Vec<T>
  if (type.startsWith('List<') || type.startsWith('Vec<')) {
    const innerType = type.slice(type.indexOf('<') + 1, -1)
    return encodeList(value as unknown[], innerType, abi)
  }

  // If type is already Uint8Array, return as-is
  if (value instanceof Uint8Array) {
    return value
  }

  throw new Error(`Unsupported type for encoding: ${type}`)
}

/**
 * Encode BigUint/BigInt
 */
function encodeBigUint(value: bigint, nested: boolean): Uint8Array {
  if (value === 0n) {
    const result = new Uint8Array([0])
    if (nested) {
      // Add 4-byte length prefix
      const withLength = new Uint8Array(5)
      withLength[3] = 1 // length = 1
      withLength[4] = 0
      return withLength
    }
    return result
  }

  // Convert to big-endian bytes
  const bytes: number[] = []
  let temp = value
  while (temp > 0n) {
    bytes.unshift(Number(temp & 0xffn))
    temp >>= 8n
  }

  const result = new Uint8Array(bytes)

  if (nested) {
    // Add 4-byte length prefix
    const length = result.length
    const withLength = new Uint8Array(4 + length)
    withLength[0] = (length >> 24) & 0xff
    withLength[1] = (length >> 16) & 0xff
    withLength[2] = (length >> 8) & 0xff
    withLength[3] = length & 0xff
    withLength.set(result, 4)
    return withLength
  }

  return result
}

/**
 * Encode struct based on ABI definition
 */
function encodeStruct(
  value: Record<string, unknown>,
  typeDef: ABITypeDefinition,
  abi: ContractABI,
): Uint8Array {
  if (!typeDef.fields) {
    throw new Error('Struct type definition missing fields')
  }

  const encoded: Uint8Array[] = []

  for (const field of typeDef.fields) {
    const fieldValue = value[field.name]
    if (fieldValue === undefined) {
      throw new Error(`Missing field '${field.name}' in struct`)
    }

    // Encode field (nested = true for struct fields - they get length prefixes)
    const fieldBytes = encodeByType(fieldValue, field.type, abi, true)
    encoded.push(fieldBytes)
  }

  // Concatenate all fields
  const totalLength = encoded.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const bytes of encoded) {
    result.set(bytes, offset)
    offset += bytes.length
  }

  return result
}

/**
 * Encode enum variant
 */
function encodeEnum(
  value: number | string,
  typeDef: ABITypeDefinition,
  _nested: boolean,
): Uint8Array {
  if (!typeDef.variants) {
    throw new Error('Enum type definition missing variants')
  }

  let discriminant: number

  if (typeof value === 'number') {
    discriminant = value
  } else if (typeof value === 'string') {
    // Check if it's a numeric string (e.g., "01", "0", "00", "1")
    const numericValue = Number(value)
    // Handle numeric strings including those with leading zeros (e.g., "00", "01")
    if (!isNaN(numericValue) && (String(numericValue) === value.replace(/^0+/, '') || value.match(/^0+$/))) {
      // It's a numeric discriminant passed as string
      discriminant = numericValue
    } else {
      // Find variant by name
      const variant = typeDef.variants.find((v) => v.name === value)
      if (!variant) {
        throw new Error(`Enum variant '${value}' not found`)
      }
      discriminant = variant.discriminant
    }
  } else {
    throw new Error(`Invalid enum value type: ${typeof value}`)
  }

  // Encode as u8 (always 1 byte, no length prefix even when nested)
  return encodeU8(discriminant)
}

/**
 * Encode list/array
 */
function encodeList(values: unknown[], innerType: string, abi: ContractABI): Uint8Array {
  // Encode count as fixed 4-byte u32 (always use nested encoding for count)
  const count = encodeFixedInt(values.length, 4)

  // Encode each item (nested = true)
  const encoded = values.map((v) => encodeByType(v, innerType, abi, true))

  // Concatenate: count + items
  const totalLength = count.length + encoded.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)

  result.set(count, 0)
  let offset = count.length
  for (const bytes of encoded) {
    result.set(bytes, offset)
    offset += bytes.length
  }

  return result
}

/**
 * Encode function arguments based on ABI
 */
export function encodeArguments(
  args: unknown[],
  params: ABIParameter[],
  abi: ContractABI,
): Uint8Array[] {
  if (args.length !== params.length) {
    throw new Error(`Expected ${params.length} arguments, got ${args.length}`)
  }

  return args.map((arg, index) => {
    const param = params[index]
    if (!param) {
      throw new Error(`Parameter at index ${index} not found`)
    }
    // Top-level arguments: nested = false
    return encodeByType(arg, param.type, abi, false)
  })
}

/**
 * ABI-aware encoder class
 */
export class ABIEncoder {
  constructor(private abi: ContractABI) {}

  /**
   * Encode function arguments
   */
  encodeFunctionArgs(functionName: string, args: unknown[]): Uint8Array[] {
    const endpoint = ABIParser.getEndpoint(this.abi, functionName)
    return encodeArguments(args, endpoint.inputs, this.abi)
  }

  /**
   * Encode constructor arguments
   */
  encodeConstructorArgs(args: unknown[]): Uint8Array[] {
    return encodeArguments(args, this.abi.constructor.inputs, this.abi)
  }

  /**
   * Encode single value by type
   */
  encodeValue(value: unknown, type: string): Uint8Array {
    return encodeByType(value, type, this.abi, false)
  }
}
