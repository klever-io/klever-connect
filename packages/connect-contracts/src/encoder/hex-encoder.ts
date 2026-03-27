/**
 * Hex-String ABI Encoder
 *
 * Encodes smart contract values directly to hex strings (as opposed to Uint8Array).
 * This is useful for building transaction metadata strings where values are
 * concatenated as hex-encoded segments separated by '@'.
 *
 * @example
 * ```typescript
 * import { encodeABIValue, encodeWithABI, encodeLengthPlusData } from '@klever/connect-contracts'
 *
 * // Encode a u64
 * encodeABIValue(42, 'u64', true)   // '000000000000002a'
 * encodeABIValue(42, 'u64', false)  // '2a'
 *
 * // Encode a struct using ABI type definitions
 * encodeWithABI(
 *   { types: { MyStruct: { type: 'struct', fields: [{ name: 'x', type: 'u32' }] } } },
 *   { x: 1 },
 *   'MyStruct'
 * )  // '00000001'
 * ```
 */

import { bech32Decode } from '@klever/connect-encoding'
import { getCleanType, getJSType } from './type-mapper'

const BUILTIN_TYPES = [
  'u64',
  'i64',
  'u32',
  'i32',
  'usize',
  'isize',
  'u16',
  'i16',
  'u8',
  'i8',
  'BigUint',
  'BigInt',
  'bool',
  'ManagedBuffer',
  'BoxedBytes',
  '&[u8]',
  'Vec',
  'String',
  '&str',
  'bytes',
  'TokenIdentifier',
  'List',
  'Array',
  'Address',
  'variadic',
  'multi',
]

function isCustomType(type: string): boolean {
  return !BUILTIN_TYPES.includes(type)
}

export interface ABITypes {
  [key: string]: {
    type: string
    fields: { name: string; type: string }[]
  }
}

function encodeHexLen(size: number): string {
  return size.toString(16).padStart(8, '0')
}

function toByteArray(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function twosComplement(value: number, bitsSize: number, isNested = true): string {
  if (value < 0) value *= -1

  if (!isNested) {
    bitsSize = Math.ceil(Math.log2(value + 1))
    if (bitsSize % 8 !== 0) {
      bitsSize = Math.ceil(bitsSize / 8) * 8
    }
  }

  const bits = value.toString(2).padStart(bitsSize, '0')
  let complement = ''
  for (let i = 0; i < bitsSize; i++) {
    complement += bits[i] === '0' ? '1' : '0'
  }
  for (let i = bitsSize - 1; i >= 0; i--) {
    if (complement[i] === '0') {
      complement = complement.slice(0, i) + '1' + complement.slice(i + 1)
      break
    } else {
      complement = complement.slice(0, i) + '0' + complement.slice(i + 1)
    }
  }

  const halfBits = bitsSize / 2
  const hexLen = halfBits / 4
  let hexComplement = parseInt(complement.slice(0, halfBits), 2).toString(16).padStart(hexLen, '0')
  hexComplement += parseInt(complement.slice(halfBits, bitsSize), 2)
    .toString(16)
    .padStart(hexLen, '0')
  return hexComplement
}

function encodeBigNumber(value: number, isNested = true): string {
  let hex = value.toString(16)
  if (value < 0) {
    hex = twosComplement(value, hex.length * 4)
  }
  if (hex.length % 2 !== 0) hex = '0' + hex

  if (value > 0) {
    let bits = value.toString(2)
    if (bits.length % 8 !== 0) {
      bits = '0'.repeat(8 - (bits.length % 8)) + bits
    }
    if (bits[0] === '1') hex = '00' + hex
  }

  if (!isNested) return hex

  const length = (hex.length / 2).toString(16).padStart(8, '0')
  return length + hex
}

function padValue(value: string, length: number, isNested = true): string {
  if (isNested) return value.padStart(length, '0')
  if (value.length % 2 !== 0) return '0' + value
  return value
}

function encodeAddress(value: string): string {
  try {
    const { prefix, data } = bech32Decode(value)
    if (prefix !== 'klv') return value
    return Array.from(data)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return value
  }
}

/**
 * Encode a value with a 4-byte length prefix (as hex string).
 *
 * For arrays: encodes each element via encodeABIValue and prepends the element count.
 * For strings: converts to bytes and prepends the byte length.
 *
 * @param value - Array of values or a string
 * @param innerType - The ABI type of each element (for arrays)
 * @param isNested - Whether to add the length prefix (default: true)
 */
export function encodeLengthPlusData(
  value: string | unknown[],
  innerType: string,
  isNested = true,
): string {
  if (typeof value !== 'string') {
    const data = value.map((v) => encodeABIValue(v, innerType, true)).join('')
    const length = value.length.toString(16).padStart(8, '0')
    if (!isNested) return data
    return length + data
  } else {
    const byteArr = toByteArray(value)
    const dataHex = Array.from(byteArr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    if (!isNested) return dataHex
    const length = byteArr.length.toString(16).padStart(8, '0')
    return length + dataHex
  }
}

function encodeVariadic(value: unknown[], type: string): string {
  const types = type.split(',')

  if (types.length > 1) {
    // multi<type1,type2,...>: encode one value per type positionally
    const values = types.map((t, index) => encodeABIValue(value[index], t.trim(), false))
    return values.join('@')
  }

  // variadic<type>: encode all items with the single inner type
  const encodedValues = value.map((item) => encodeABIValue(item, type, false))
  return encodedValues.join('@')
}

/**
 * Encode a value by its ABI type to a hex string.
 *
 * Handles all primitive types (u8-u64, i8-i64, bool, BigUint, BigInt, Address),
 * variable-length types (String, bytes, ManagedBuffer, TokenIdentifier),
 * and collections (List, Vec, Array, variadic, multi).
 *
 * @param value - The value to encode
 * @param type - The ABI type string
 * @param isNested - If true, use fixed-width / length-prefixed encoding (default: true)
 * @returns Hex-encoded string
 */
export function encodeABIValue(value: unknown, type: string, isNested = true): string {
  const outerType = getCleanType(type, false).split('<')[0] ?? type
  const ltIndex = type.indexOf('<')
  const innerType = ltIndex >= 0 ? type.slice(ltIndex + 1, type.length - 1) : ''

  let typeParsedValue = value
  const jsType = getJSType(type)
  if (jsType === 'number') {
    typeParsedValue = Number(typeParsedValue)
    if (isNaN(typeParsedValue as number)) return ''
  }

  let hexNumber: string

  switch (outerType) {
    case 'u64':
    case 'i64':
      if ((typeParsedValue as number) < 0)
        return twosComplement(typeParsedValue as number, 64, isNested)
      hexNumber = (typeParsedValue as number).toString(16)
      return padValue(hexNumber, 16, isNested)
    case 'u32':
    case 'i32':
    case 'usize':
    case 'isize':
      if ((typeParsedValue as number) < 0)
        return twosComplement(typeParsedValue as number, 32, isNested)
      hexNumber = (typeParsedValue as number).toString(16)
      return padValue(hexNumber, 8, isNested)
    case 'u16':
    case 'i16':
      if ((typeParsedValue as number) < 0)
        return twosComplement(typeParsedValue as number, 16, isNested)
      hexNumber = (typeParsedValue as number).toString(16)
      return padValue(hexNumber, 4, isNested)
    case 'u8':
    case 'i8':
      if ((typeParsedValue as number) < 0)
        return twosComplement(typeParsedValue as number, 8, isNested)
      hexNumber = (typeParsedValue as number).toString(16)
      return padValue(hexNumber, 2, isNested)
    case 'BigUint':
    case 'BigInt':
      return encodeBigNumber(typeParsedValue as number, isNested)
    case 'bool':
      return typeParsedValue ? '01' : '00'
    case 'ManagedBuffer':
    case 'BoxedBytes':
    case '&[u8]':
    case 'Vec':
    case 'String':
    case '&str':
    case 'bytes':
    case 'TokenIdentifier':
    case 'List':
    case 'Array':
      return encodeLengthPlusData(typeParsedValue as string | unknown[], innerType, isNested)
    case 'Address':
      return encodeAddress(typeParsedValue as string)
    case 'variadic':
    case 'multi':
      return encodeVariadic(typeParsedValue as unknown[], innerType)
    default:
      return typeParsedValue as string
  }
}

function encodeWithABIRecursive(
  abiTypes: ABITypes,
  value: Record<string, unknown>,
  type: string,
  curr: string,
): string {
  const abiType = abiTypes[type] || null
  if (!abiType) return ''

  let result = curr

  abiType.fields.forEach((item: { name: string; type: string }) => {
    if (item.type.startsWith('Option<')) {
      const not = value[item.name] == null
      if (not) {
        result += '00'
        return
      }
      const convertedType = item.type.slice(7, -1)
      if (isCustomType(convertedType)) {
        result = encodeWithABIRecursive(
          abiTypes,
          value[item.name] as Record<string, unknown>,
          convertedType,
          result + '01',
        )
        return
      }
      result += '01' + encodeABIValue(value[item.name], convertedType, true)
      return
    }

    if (item.type.startsWith('List<')) {
      const convertedType = item.type.slice(5, -1)
      if (isCustomType(convertedType)) {
        result += encodeHexLen((value[item.name] as unknown[])?.length || 0)
        ;(value[item.name] as unknown[])?.forEach((listItem: unknown) => {
          result = encodeWithABIRecursive(
            abiTypes,
            listItem as Record<string, unknown>,
            convertedType,
            result,
          )
        })
        return
      }
      result += encodeABIValue(value[item.name], item.type, true)
      return
    }

    if (isCustomType(item.type)) {
      result = encodeWithABIRecursive(
        abiTypes,
        value[item.name] as Record<string, unknown>,
        item.type,
        result,
      )
      return
    }

    result += encodeABIValue(value[item.name], item.type, true)
  })

  return result
}

/**
 * Encode a value using ABI type definitions (struct-aware).
 *
 * Recursively encodes values using custom type definitions from the ABI,
 * handling nested structs, Option fields, and List fields with custom types.
 *
 * @param abi - Object containing type definitions (e.g. `{ types: { MyStruct: { ... } } }`)
 * @param value - The object value to encode
 * @param type - The ABI type name to look up in abi.types
 * @returns Hex-encoded string
 *
 * @example
 * ```typescript
 * const abi = {
 *   types: {
 *     Transfer: {
 *       type: 'struct',
 *       fields: [
 *         { name: 'to', type: 'Address' },
 *         { name: 'amount', type: 'u64' }
 *       ]
 *     }
 *   }
 * }
 * encodeWithABI(abi, { to: 'klv1...', amount: 100 }, 'Transfer')
 * ```
 */
export function encodeWithABI(abi: { types: ABITypes }, value: unknown, type: string): string {
  return encodeWithABIRecursive(abi.types, value as Record<string, unknown>, type, '')
}
