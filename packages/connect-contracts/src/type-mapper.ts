/**
 * ABI Type Mapper
 *
 * Maps Klever smart contract ABI types (Rust types) to JavaScript/UI types.
 * Useful for form generation and type classification in frontends.
 *
 * @example
 * ```typescript
 * import { getJSType, getCleanType } from '@klever/connect-contracts'
 *
 * getJSType('u64')           // 'number'
 * getJSType('Address')       // 'string'
 * getJSType('bool')          // 'checkbox'
 * getJSType('List<u64>')     // 'array'
 * getJSType('Option<u64>')   // 'number'
 * getJSType('MyStruct')      // 'MyStruct' (unknown types returned as-is)
 *
 * getCleanType('Option<u64>')          // 'u64'
 * getCleanType('MyStruct<T>', false)   // 'MyStruct'
 * ```
 */

export const ABITypeMap: Record<string, string[]> = {
  number: [
    'biguint',
    'bigint',
    'u8',
    'u16',
    'u32',
    'u64',
    'i8',
    'i16',
    'i32',
    'i64',
    'usize',
    'isize',
  ],
  string: [
    'tokenidentifier',
    'string',
    'address',
    'bytes',
    'hash',
    'publickey',
    'signature',
    'managedbuffer',
    'boxedbytes',
    '&[u8]',
    'vec<u8>',
    '&str',
    'managedvec',
  ],
  array: ['tuple', 'array', 'list'],
  checkbox: ['bool'],
  variadic: ['multi', 'variadic'],
}

const allKnownTypes = Object.values(ABITypeMap).flat()

/**
 * Strip Option<> wrapper and generics from an ABI type string.
 *
 * @param abiType - The raw ABI type (e.g. 'Option<u64>', 'List<MyStruct>')
 * @param toLower - Whether to lowercase the result (default: true)
 * @returns The cleaned type string
 * @note For collection types (List, Array, Tuple), returns the **container** type
 * (e.g. `'list'`), not the element type. The inner type information is discarded.
 */
export function getCleanType(abiType: string, toLower = true): string {
  const isOptional = abiType.toLowerCase().startsWith('option')

  if (isOptional) {
    const matches = abiType.match(/<(.*)>/)
    if (matches && matches.length > 1) abiType = matches[1] ?? abiType
  }

  if (!allKnownTypes.includes(abiType.toLowerCase())) {
    abiType = abiType.split('<')[0] ?? abiType
  }

  if (toLower) {
    abiType = abiType.toLowerCase()
  }
  return abiType
}

/**
 * Map an ABI type to a JavaScript/UI type category.
 *
 * Returns one of: 'number', 'string', 'array', 'checkbox', 'variadic',
 * or the cleaned type name if it's a custom struct/enum.
 *
 * @param abiType - The raw ABI type (e.g. 'u64', 'Address', 'Option<bool>')
 * @returns The JS type category
 */
export function getJSType(abiType: string): string {
  const cleanType = getCleanType(abiType, true)

  for (const [key, values] of Object.entries(ABITypeMap)) {
    if (values.includes(cleanType)) {
      return key
    }
  }

  return getCleanType(abiType, false)
}
