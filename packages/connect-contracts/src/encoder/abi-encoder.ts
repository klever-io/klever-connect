/**
 * ABI-Aware Parameter Encoder
 *
 * Automatically encodes parameters based on ABI type definitions.
 * This module provides intelligent encoding that handles all Klever smart contract types,
 * including primitives (u8, u32, u64, bool), complex types (structs, enums), and
 * variable-length types (strings, bytes, lists).
 *
 * @remarks
 * Encoding rules:
 * - Fixed-size types (u8, u16, u32, u64, bool): Big-endian, leading zeros trimmed (min 1 byte)
 * - Top-level arguments: No length prefix
 * - Nested arguments (struct fields, list items): 4-byte length prefix for variable types
 * - Addresses: Decoded from bech32 to 32 raw bytes
 *
 * @example Using ABIEncoder class
 * ```typescript
 * import { ABIEncoder } from '@klever/connect-contracts'
 *
 * const encoder = new ABIEncoder(contractABI)
 *
 * // Encode function arguments
 * const encoded = encoder.encodeFunctionArgs('transfer', [
 *   'klv1receiver...',
 *   1000000n
 * ])
 * ```
 *
 * @example Manual encoding with encodeByType
 * ```typescript
 * import { encodeByType } from '@klever/connect-contracts'
 *
 * // Encode a BigUint
 * const encoded = encodeByType(1000000n, 'BigUint', abi, false)
 *
 * // Encode a struct
 * const betStruct = {
 *   betType: 0,
 *   betValue: 100n
 * }
 * const encoded = encodeByType(betStruct, 'Bet', abi, false)
 * ```
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

  // Handle signed integers (i8, i16, i32, i64)
  if (type === 'i8') {
    const numValue = toNumber(value)
    // Convert signed to unsigned using two's complement
    const unsigned = numValue < 0 ? numValue + 256 : numValue
    if (nested) {
      return encodeFixedInt(unsigned, 1)
    }
    return encodeU8(unsigned)
  }
  if (type === 'i16') {
    const numValue = toNumber(value)
    const unsigned = numValue < 0 ? numValue + 65536 : numValue
    if (nested) {
      return encodeFixedInt(unsigned, 2)
    }
    return encodeU16(unsigned)
  }
  if (type === 'i32') {
    const numValue = toNumber(value)
    const unsigned = numValue < 0 ? numValue + 4294967296 : numValue
    if (nested) {
      return encodeFixedInt(unsigned, 4)
    }
    return encodeU32(unsigned)
  }
  if (type === 'i64') {
    const bigintValue = toBigInt(value)
    const unsigned = bigintValue < 0n ? bigintValue + 18446744073709551616n : bigintValue
    if (nested) {
      return encodeFixedInt(unsigned, 8)
    }
    return encodeU64(unsigned)
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

  // Handle fixed-size arrays: arrayN<T> (e.g., array3<u8>, array16<u8>)
  if (type.startsWith('array') && type.includes('<')) {
    const match = type.match(/^array(\d+)<(.+)>$/)
    if (match) {
      const size = parseInt(match[1] || '0', 10)
      const innerType = match[2] || ''
      return encodeFixedArray(value as unknown[], innerType, size, abi)
    }
  }

  // Handle variadic<T>
  // Note: variadic is handled at the parameter level in encodeArguments
  // Individual variadic items are encoded as their inner type
  if (type.startsWith('variadic<')) {
    const innerType = type.slice(9, -1) // Extract T from variadic<T>
    // Each variadic item is encoded individually as top-level (nested = false)
    return encodeByType(value, innerType, abi, nested)
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
    if (
      !isNaN(numericValue) &&
      (String(numericValue) === value.replace(/^0+/, '') || value.match(/^0+$/))
    ) {
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
 * Encode fixed-size array (arrayN<T>)
 */
function encodeFixedArray(
  values: unknown[],
  innerType: string,
  size: number,
  abi: ContractABI,
): Uint8Array {
  // Handle hex string input for u8 arrays (common for hashes, etc.)
  if (innerType === 'u8' && typeof values === 'string') {
    const hex = (values as unknown as string).startsWith('0x')
      ? (values as unknown as string).slice(2)
      : (values as unknown as string)
    if (hex.length !== size * 2) {
      throw new Error(
        `Expected hex string of ${size * 2} characters (${size} bytes), got ${hex.length}`,
      )
    }
    const result = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      result[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return result
  }

  // Handle Uint8Array input for u8 arrays
  if (innerType === 'u8' && values instanceof Uint8Array) {
    if ((values as unknown as Uint8Array).length !== size) {
      throw new Error(
        `Expected array of size ${size}, got ${(values as unknown as Uint8Array).length}`,
      )
    }
    return values as unknown as Uint8Array
  }

  // Handle array input
  if (!Array.isArray(values)) {
    throw new Error(`Expected array for type array${size}<${innerType}>, got ${typeof values}`)
  }

  if (values.length !== size) {
    throw new Error(`Expected array of size ${size}, got ${values.length}`)
  }

  // Encode each item (nested = true)
  // No count prefix for fixed-size arrays, just concatenated items
  const encoded = values.map((v) => encodeByType(v, innerType, abi, true))

  // Concatenate all items
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
 * Encode function arguments based on ABI
 */
export function encodeArguments(
  args: unknown[],
  params: ABIParameter[],
  abi: ContractABI,
): Uint8Array[] {
  // Check if last parameter is variadic (multi_result: true)
  const hasVariadic = params.length > 0 && params[params.length - 1]?.multi_result === true

  if (!hasVariadic && args.length !== params.length) {
    throw new Error(`Expected ${params.length} arguments, got ${args.length}`)
  }

  if (hasVariadic && args.length < params.length) {
    throw new Error(
      `Expected at least ${params.length} arguments (last is variadic), got ${args.length}`,
    )
  }

  const encoded: Uint8Array[] = []
  let argIndex = 0

  for (let paramIndex = 0; paramIndex < params.length; paramIndex++) {
    const param = params[paramIndex]
    if (!param) {
      throw new Error(`Parameter at index ${paramIndex} not found`)
    }

    // If this is a variadic parameter (last parameter with multi_result: true)
    if (param.multi_result) {
      // The argument should be an array
      const arg = args[argIndex]
      if (!Array.isArray(arg)) {
        throw new Error(`Variadic parameter '${param.name}' expects an array`)
      }

      // Encode each item in the array as a separate top-level argument
      for (const item of arg) {
        const itemEncoded = encodeByType(item, param.type, abi, false)
        encoded.push(itemEncoded)
      }
      argIndex++
    } else {
      // Regular parameter
      const arg = args[argIndex]
      if (arg === undefined) {
        throw new Error(`Argument at index ${argIndex} not found`)
      }

      // Top-level arguments: nested = false
      const argEncoded = encodeByType(arg, param.type, abi, false)
      encoded.push(argEncoded)
      argIndex++
    }
  }

  return encoded
}

/**
 * ABI-aware encoder class
 *
 * Provides high-level encoding methods that use the contract's ABI to
 * automatically encode values to the correct format.
 *
 * @example
 * ```typescript
 * const encoder = new ABIEncoder(abi)
 *
 * // Encode function arguments
 * const args = encoder.encodeFunctionArgs('transfer', [
 *   'klv1receiver...',
 *   1000000n
 * ])
 *
 * // Encode constructor arguments
 * const constructorArgs = encoder.encodeConstructorArgs([
 *   'MyToken',
 *   'MTK',
 *   1000000000n
 * ])
 *
 * // Encode single value
 * const encoded = encoder.encodeValue(1000n, 'u64')
 * ```
 */
export class ABIEncoder {
  constructor(private abi: ContractABI) {}

  /**
   * Encode function arguments
   *
   * Encodes an array of values according to the function's ABI definition.
   * Automatically handles type conversion and validation.
   *
   * @param functionName - The name of the function
   * @param args - Array of argument values
   * @returns Array of encoded arguments as Uint8Array
   * @throws Error if argument count doesn't match ABI
   * @throws Error if argument type is invalid
   *
   * @example
   * ```typescript
   * const encoder = new ABIEncoder(abi)
   *
   * // Encode transfer function arguments
   * const encoded = encoder.encodeFunctionArgs('transfer', [
   *   'klv1receiver...',  // Address
   *   1000000n            // BigUint amount
   * ])
   * ```
   */
  encodeFunctionArgs(functionName: string, args: unknown[]): Uint8Array[] {
    const endpoint = ABIParser.getEndpoint(this.abi, functionName)
    return encodeArguments(args, endpoint.inputs, this.abi)
  }

  /**
   * Encode constructor arguments
   *
   * Encodes constructor arguments for contract deployment.
   *
   * @param args - Array of constructor argument values
   * @returns Array of encoded arguments as Uint8Array
   * @throws Error if argument count doesn't match ABI
   * @throws Error if argument type is invalid
   *
   * @example
   * ```typescript
   * const encoder = new ABIEncoder(tokenABI)
   *
   * // Encode token constructor arguments
   * const encoded = encoder.encodeConstructorArgs([
   *   'MyToken',      // name: string
   *   'MTK',          // symbol: string
   *   1000000000n     // totalSupply: BigUint
   * ])
   * ```
   */
  encodeConstructorArgs(args: unknown[]): Uint8Array[] {
    return encodeArguments(args, this.abi.constructor.inputs, this.abi)
  }

  /**
   * Encode single value by type
   *
   * Encodes a single value according to its ABI type.
   * Useful for manual encoding or testing.
   *
   * @param value - The value to encode
   * @param type - The ABI type (e.g., 'u32', 'Address', 'BigUint')
   * @returns Encoded value as Uint8Array
   *
   * @example
   * ```typescript
   * const encoder = new ABIEncoder(abi)
   *
   * // Encode different types
   * const u32 = encoder.encodeValue(100, 'u32')
   * const addr = encoder.encodeValue('klv1...', 'Address')
   * const bigint = encoder.encodeValue(1000000n, 'BigUint')
   * ```
   */
  encodeValue(value: unknown, type: string): Uint8Array {
    return encodeByType(value, type, this.abi, false)
  }
}
