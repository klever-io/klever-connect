/**
 * Tests for Result Decoder
 */

import { describe, expect, it } from 'vitest'
import {
  contractResult,
  decodeAddress,
  decodeBase64,
  decodeBool,
  decodeBytes,
  decodeString,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  encodeBase64,
  hexToBase64,
} from '../decoder/result-decoder'
import { decodeResultsWithMetadata, ABIDecoder } from '../decoder/abi-decoder'
import type { ContractABI } from '../types/abi'

describe('Result Decoder', () => {
  describe('decodeU8', () => {
    it('should decode u8 values', () => {
      const bytes = new Uint8Array([42])
      const result = decodeU8(bytes)
      expect(result.value).toBe(42)
      expect(result.consumed).toBe(1)
      expect(result.type).toBe('u8')
    })

    it('should decode u8 with offset', () => {
      const bytes = new Uint8Array([0, 0, 255])
      const result = decodeU8(bytes, 2)
      expect(result.value).toBe(255)
      expect(result.consumed).toBe(1)
    })

    it('should throw on insufficient bytes', () => {
      const bytes = new Uint8Array([])
      expect(() => decodeU8(bytes)).toThrow('Insufficient bytes')
    })
  })

  describe('decodeU16', () => {
    it('should decode u16 values', () => {
      const bytes = new Uint8Array([0x01, 0x00]) // 256 in big-endian
      const result = decodeU16(bytes)
      expect(result.value).toBe(256)
      expect(result.consumed).toBe(2)
    })

    it('should decode max u16', () => {
      const bytes = new Uint8Array([0xff, 0xff])
      const result = decodeU16(bytes)
      expect(result.value).toBe(65535)
    })
  })

  describe('decodeU32', () => {
    it('should decode u32 values', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x32]) // 50
      const result = decodeU32(bytes)
      expect(result.value).toBe(50)
      expect(result.consumed).toBe(4)
    })

    it('should decode larger u32', () => {
      const bytes = new Uint8Array([0x00, 0x01, 0x00, 0x00]) // 65536
      const result = decodeU32(bytes)
      expect(result.value).toBe(65536)
    })

    it('should decode max u32', () => {
      const bytes = new Uint8Array([0xff, 0xff, 0xff, 0xff])
      const result = decodeU32(bytes)
      expect(result.value).toBe(0xffffffff)
    })
  })

  describe('decodeU64', () => {
    it('should decode u64 values as bigint', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2a]) // 42
      const result = decodeU64(bytes)
      expect(result.value).toBe(42n)
      expect(result.consumed).toBe(8)
    })

    it('should decode large u64', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00])
      const result = decodeU64(bytes)
      expect(result.value).toBe(0x100000000n)
    })
  })

  describe('decodeBool', () => {
    it('should decode true', () => {
      const bytes = new Uint8Array([0x01])
      const result = decodeBool(bytes)
      expect(result.value).toBe(true)
      expect(result.consumed).toBe(1)
    })

    it('should decode false', () => {
      const bytes = new Uint8Array([0x00])
      const result = decodeBool(bytes)
      expect(result.value).toBe(false)
      expect(result.consumed).toBe(1)
    })
  })

  describe('decodeAddress', () => {
    it('should decode 32-byte address to bech32', () => {
      // Create a 32-byte address (all zeros for testing)
      const bytes = new Uint8Array(32).fill(0)
      const result = decodeAddress(bytes)

      expect(result.value).toMatch(/^klv1/)
      expect(result.consumed).toBe(32)
      expect(result.type).toBe('Address')
    })

    it('should throw on insufficient bytes', () => {
      const bytes = new Uint8Array(20) // Only 20 bytes
      expect(() => decodeAddress(bytes)).toThrow('Insufficient bytes')
    })
  })

  describe('decodeString', () => {
    it('should decode string without length prefix', () => {
      const bytes = new TextEncoder().encode('hello')
      const result = decodeString(bytes)

      expect(result.value).toBe('hello')
      expect(result.consumed).toBe(5)
      expect(result.type).toBe('string')
    })

    it('should decode string with length prefix', () => {
      // Length: 5 = 0x00000005, followed by "hello"
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
      const result = decodeString(bytes, 0, true)

      expect(result.value).toBe('hello')
      expect(result.consumed).toBe(9) // 4 bytes length + 5 bytes data
    })

    it('should decode empty string', () => {
      const bytes = new Uint8Array([])
      const result = decodeString(bytes)

      expect(result.value).toBe('')
      expect(result.consumed).toBe(0)
    })
  })

  describe('decodeBytes', () => {
    it('should decode bytes without length prefix', () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03])
      const result = decodeBytes(bytes)

      expect(result.value).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
      expect(result.consumed).toBe(3)
    })

    it('should decode bytes with length prefix', () => {
      // Length: 3 = 0x00000003, followed by bytes
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x03, 0x01, 0x02, 0x03])
      const result = decodeBytes(bytes, 0, true)

      expect(result.value).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
      expect(result.consumed).toBe(7) // 4 bytes length + 3 bytes data
    })
  })

  describe('base64 encoding/decoding', () => {
    it('should encode bytes to base64', () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03])
      const base64 = encodeBase64(bytes)

      // Should be a valid base64 string
      expect(base64).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('should decode base64 to bytes', () => {
      const base64 = 'AQIDBA==' // [1, 2, 3, 4]
      const bytes = decodeBase64(base64)

      expect(Array.from(bytes)).toEqual([1, 2, 3, 4])
    })

    it('should roundtrip base64 encode/decode', () => {
      const original = new Uint8Array([0xff, 0x00, 0x42, 0xaa])
      const base64 = encodeBase64(original)
      const decoded = decodeBase64(base64)

      expect(Array.from(decoded)).toEqual(Array.from(original))
    })
  })

  describe('contractResult helper', () => {
    it('should expose all decoding functions', () => {
      expect(contractResult.u8).toBe(decodeU8)
      expect(contractResult.u16).toBe(decodeU16)
      expect(contractResult.u32).toBe(decodeU32)
      expect(contractResult.u64).toBe(decodeU64)
      expect(contractResult.bool).toBe(decodeBool)
      expect(contractResult.address).toBe(decodeAddress)
      expect(contractResult.string).toBe(decodeString)
      expect(contractResult.bytes).toBe(decodeBytes)
      expect(contractResult.fromBase64).toBe(decodeBase64)
      expect(contractResult.toBase64).toBe(encodeBase64)
    })
  })

  describe('integration: encode and decode', () => {
    it('should roundtrip u32 values', async () => {
      const { encodeU32 } = await import('../encoder/param-encoder')

      const value = 12345
      const encoded = encodeU32(value)

      // For decoding, u32 is always 4 bytes in results
      const padded = new Uint8Array(4)
      const encodedArray = Array.from(encoded)
      padded.set(encodedArray, 4 - encodedArray.length) // Pad left with zeros

      const decoded = decodeU32(padded)
      expect(decoded.value).toBe(value)
    })

    it('should roundtrip bool values', async () => {
      const { encodeBool } = await import('../encoder/param-encoder')

      const encoded = encodeBool(true)
      const decoded = decodeBool(encoded)
      expect(decoded.value).toBe(true)
    })

    it('should roundtrip string values', async () => {
      const { encodeString } = await import('../encoder/param-encoder')

      const value = 'test string'
      const encoded = encodeString(value, true) // With length prefix
      const decoded = decodeString(encoded, 0, true)
      expect(decoded.value).toBe(value)
    })
  })

  describe('decodeResultsWithMetadata', () => {
    it('should decode results with type and raw data', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'testFunction',
            mutability: 'readonly',
            inputs: [],
            outputs: [
              { name: 'result', type: 'u32' },
              { name: 'flag', type: 'bool' },
            ],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      // Encode test data: u32(42) and bool(true)
      const data = [
        encodeBase64(new Uint8Array([0x2a])), // 42
        encodeBase64(new Uint8Array([0x01])), // true
      ]

      const params = [
        { name: 'result', type: 'u32' },
        { name: 'flag', type: 'bool' },
      ]

      const decoded = decodeResultsWithMetadata(data, params, mockABI)

      expect(decoded.raw).toEqual(data)
      expect(decoded.values).toHaveLength(2)

      expect(decoded.values[0]).toEqual({
        type: 'u32',
        value: 42,
        raw: data[0],
      })

      expect(decoded.values[1]).toEqual({
        type: 'bool',
        value: true,
        raw: data[1],
      })
    })

    it('should work with ABIDecoder class', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getValue',
            mutability: 'readonly',
            inputs: [],
            outputs: [{ name: 'value', type: 'u64' }],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      // u64(1000)
      const data = [encodeBase64(new Uint8Array([0x03, 0xe8]))]

      const decoded = decoder.decodeFunctionResultsWithMetadata('getValue', data)

      expect(decoded.raw).toEqual(data)
      expect(decoded.values).toHaveLength(1)
      expect(decoded.values[0]?.type).toBe('u64')
      expect(decoded.values[0]?.value).toBe(1000n)
      expect(decoded.values[0]?.raw).toBe(data[0])
    })

    it('should decode real Bet struct correctly', () => {
      const diceABI: ContractABI = {
        buildInfo: {
          rustc: {
            version: '1.87.0',
            commitHash: '',
            commitDate: '',
            channel: 'Stable',
            short: '',
          },
          contractCrate: { name: 'dice', version: '0.0.0' },
          framework: { name: 'klever-sc', version: '0.45.0' },
        },
        name: 'Dice',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'bet',
            mutability: 'mutable',
            inputs: [],
            outputs: [{ name: 'result', type: 'Bet' }],
          },
        ],
        kdaAttributes: [],
        types: {
          Bet: {
            type: 'struct',
            fields: [
              { name: 'bet_type', type: 'u32' },
              { name: 'bet_value', type: 'u32' },
              { name: 'dice_value', type: 'u32' },
              { name: 'multiplier', type: 'u32' },
              { name: 'is_winner', type: 'bool' },
            ],
          },
        },
      }

      const decoder = new ABIDecoder(diceABI)

      // Real data: hex 000000010000000c000000600000007201
      // Expected: bet_type=1, bet_value=12, dice_value=96, multiplier=114, is_winner=true
      const returnData = ['AAAAAQAAAAwAAABgAAAAcgE=']

      const result = decoder.decodeFunctionResultsWithMetadata('bet', returnData)

      expect(result.raw).toEqual(returnData)
      expect(result.values).toHaveLength(1)
      expect(result.values[0]?.type).toBe('Bet')
      expect(result.values[0]?.raw).toBe(returnData[0])

      const bet = result.values[0]?.value as any
      expect(bet.bet_type).toBe(1)
      expect(bet.bet_value).toBe(12)
      expect(bet.dice_value).toBe(96)
      expect(bet.multiplier).toBe(114)
      expect(bet.is_winner).toBe(true)
    })

    it('should decode Bet struct from hex event data using hexToBase64', () => {
      const diceABI: ContractABI = {
        buildInfo: {
          rustc: {
            version: '1.87.0',
            commitHash: '',
            commitDate: '',
            channel: 'Stable',
            short: '',
          },
          contractCrate: { name: 'dice', version: '0.0.0' },
          framework: { name: 'klever-sc', version: '0.45.0' },
        },
        name: 'Dice',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'bet',
            mutability: 'mutable',
            inputs: [],
            outputs: [{ name: 'result', type: 'Bet' }],
          },
        ],
        kdaAttributes: [],
        types: {
          Bet: {
            type: 'struct',
            fields: [
              { name: 'bet_type', type: 'u32' },
              { name: 'bet_value', type: 'u32' },
              { name: 'dice_value', type: 'u32' },
              { name: 'multiplier', type: 'u32' },
              { name: 'is_winner', type: 'bool' },
            ],
          },
        },
      }

      const decoder = new ABIDecoder(diceABI)

      // Event data is hex-encoded (from logs.events)
      const hexData = '000000010000000c000000600000007201'

      // Convert hex to base64 for decoder
      const base64Data = hexToBase64(hexData)
      expect(base64Data).toBe('AAAAAQAAAAwAAABgAAAAcgE=')

      const result = decoder.decodeFunctionResultsWithMetadata('bet', [base64Data])

      const bet = result.values[0]?.value as any
      expect(bet.bet_type).toBe(1)
      expect(bet.bet_value).toBe(12)
      expect(bet.dice_value).toBe(96)
      expect(bet.multiplier).toBe(114)
      expect(bet.is_winner).toBe(true)
    })

    it('should decode Bet struct directly from hex with encoding parameter', () => {
      const diceABI: ContractABI = {
        buildInfo: {
          rustc: {
            version: '1.87.0',
            commitHash: '',
            commitDate: '',
            channel: 'Stable',
            short: '',
          },
          contractCrate: { name: 'dice', version: '0.0.0' },
          framework: { name: 'klever-sc', version: '0.45.0' },
        },
        name: 'Dice',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'bet',
            mutability: 'mutable',
            inputs: [],
            outputs: [{ name: 'result', type: 'Bet' }],
          },
        ],
        kdaAttributes: [],
        types: {
          Bet: {
            type: 'struct',
            fields: [
              { name: 'bet_type', type: 'u32' },
              { name: 'bet_value', type: 'u32' },
              { name: 'dice_value', type: 'u32' },
              { name: 'multiplier', type: 'u32' },
              { name: 'is_winner', type: 'bool' },
            ],
          },
        },
      }

      const decoder = new ABIDecoder(diceABI)

      // Event data is hex-encoded (from logs.events)
      const hexData = '000000010000000c000000600000007201'

      // Decode directly from hex using encoding parameter
      const result = decoder.decodeFunctionResultsWithMetadata('bet', [hexData], 'hex')

      // Raw data should be preserved as hex
      expect(result.raw[0]).toBe(hexData)
      expect(result.values[0]?.raw).toBe(hexData)

      const bet = result.values[0]?.value as any
      expect(bet.bet_type).toBe(1)
      expect(bet.bet_value).toBe(12)
      expect(bet.dice_value).toBe(96)
      expect(bet.multiplier).toBe(114)
      expect(bet.is_winner).toBe(true)
    })

    it('should handle 0x prefix in hex encoding', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getValue',
            mutability: 'readonly',
            inputs: [],
            outputs: [{ name: 'value', type: 'u32' }],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      // With 0x prefix
      const result = decoder.decodeFunctionResultsWithMetadata('getValue', ['0x2a'], 'hex')

      expect(result.values[0]?.value).toBe(42)
      expect(result.values[0]?.raw).toBe('0x2a')
    })
  })

  describe('hexToBase64', () => {
    it('should convert hex to base64', () => {
      const hex = '000000010000000c000000600000007201'
      const base64 = hexToBase64(hex)
      expect(base64).toBe('AAAAAQAAAAwAAABgAAAAcgE=')
    })

    it('should handle 0x prefix', () => {
      const hex = '0x48656c6c6f'
      const base64 = hexToBase64(hex)
      expect(base64).toBe('SGVsbG8=')
    })

    it('should handle empty string', () => {
      const hex = ''
      const base64 = hexToBase64(hex)
      expect(base64).toBe('')
    })
  })

  describe('variadic parameters', () => {
    it('should decode variadic TokenIdentifier from base64', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getAllKnownTokens',
            mutability: 'readonly',
            inputs: [],
            outputs: [
              {
                type: 'variadic<TokenIdentifier>',
                multi_result: true,
              },
            ],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      // Real example from user: 2 tokens
      const returnData = ['RVRIUkNPSU4tMjJZUw==', 'RVRIR0dDT0lOLVdPQjE=']

      const result = decoder.decodeFunctionResultsWithMetadata('getAllKnownTokens', returnData)

      expect(result.raw).toEqual(returnData)
      expect(result.values).toHaveLength(2)

      const expectedResults = ['ETHRCOIN-22YS', 'ETHGGCOIN-WOB1']
      for (let i = 0; i < expectedResults.length; i++) {
        expect(result.values[i]?.type).toBe('variadic<TokenIdentifier>')
        expect(result.values[i]?.value).toBe(expectedResults[i])
      }

      // Raw should be an array for variadic
      expect(Array.isArray(result.raw)).toBe(true)
      expect(result.raw).toEqual(returnData)
    })

    it('should decode single variadic TokenIdentifier value', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getToken',
            mutability: 'readonly',
            inputs: [],
            outputs: [{ type: 'variadic<TokenIdentifier>', multi_result: true }],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      // Single value (hex from user example: 45544852434f494e2d54454f42)
      const tokenHex = '45544852434f494e2d54454f42'
      const tokenBase64 = hexToBase64(tokenHex)

      const result = decoder.decodeFunctionResultsWithMetadata('getToken', [tokenBase64])

      expect(result.values).toHaveLength(1)
      const token = result.values[0]
      expect(token?.type).toBe('variadic<TokenIdentifier>')
      expect(token?.value).toBe('ETHRCOIN-TEOB')
    })

    it('should decode empty variadic parameter', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getTokens',
            mutability: 'readonly',
            inputs: [],
            outputs: [{ type: 'variadic<TokenIdentifier>', multi_result: true }],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      // Empty array - no return data
      const result = decoder.decodeFunctionResultsWithMetadata('getTokens', [])

      expect(result.values).toHaveLength(0)
      expect(result.raw).toEqual([])
    })

    // Note: multi_result is meant to be the ONLY parameter in outputs
    // It's not designed to work with mixed parameters

    it('should decode variadic u32 values', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getNumbers',
            mutability: 'readonly',
            inputs: [],
            outputs: [{ type: 'variadic<u32>', multi_result: true }],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      const returnData = [
        encodeBase64(new Uint8Array([0x01])), // 1
        encodeBase64(new Uint8Array([0x02])), // 2
        encodeBase64(new Uint8Array([0x03])), // 3
      ]

      const result = decoder.decodeFunctionResultsWithMetadata('getNumbers', returnData)

      expect(result.values).toHaveLength(3)
      expect(result.values[0]?.type).toBe('variadic<u32>')
      expect(result.values[0]?.value).toBe(1)
      expect(result.values[1]?.value).toBe(2)
      expect(result.values[2]?.value).toBe(3)
    })

    it('should decode variadic with multi<T1,T2,T3>', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'multi_result_vec',
            mutability: 'mutable',
            inputs: [],
            outputs: [
              {
                type: 'variadic<multi<u32,bool,()>>',
                multi_result: true,
              },
            ],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      // Example: 2 items, each with (u32, bool, unit)
      // Item 1: u32=100 (4 bytes: 00000064), bool=true (1 byte: 01), unit=() (0 bytes)
      // Item 2: u32=200 (4 bytes: 000000c8), bool=false (1 byte: 00), unit=() (0 bytes)
      const returnData = [
        encodeBase64(new Uint8Array([0x00, 0x00, 0x00, 0x64])), // u32 = 100
        encodeBase64(new Uint8Array([0x01])), // bool = true
        encodeBase64(new Uint8Array([])), // unit = ()
        encodeBase64(new Uint8Array([0x00, 0x00, 0x00, 0xc8])), // u32 = 200
        encodeBase64(new Uint8Array([0x00])), // bool = false
        encodeBase64(new Uint8Array([])), // unit = ()
      ]

      const result = decoder.decodeFunctionResultsWithMetadata('multi_result_vec', returnData)

      // Should have 6 decoded values (2 items × 3 types each)
      expect(result.values).toHaveLength(6)

      // First item's values
      expect(result.values[0]?.type).toBe('u32')
      expect(result.values[0]?.value).toBe(100)
      expect(result.values[1]?.type).toBe('bool')
      expect(result.values[1]?.value).toBe(true)
      expect(result.values[2]?.type).toBe('()')
      expect(result.values[2]?.value).toBe(undefined) // unit type

      // Second item's values
      expect(result.values[3]?.type).toBe('u32')
      expect(result.values[3]?.value).toBe(200)
      expect(result.values[4]?.type).toBe('bool')
      expect(result.values[4]?.value).toBe(false)
      expect(result.values[5]?.type).toBe('()')
      expect(result.values[5]?.value).toBe(undefined) // unit type
    })

    it('should decode variadic with decodeFunctionResults (no metadata)', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'getTokens',
            mutability: 'readonly',
            inputs: [],
            outputs: [{ type: 'variadic<TokenIdentifier>', multi_result: true }],
          },
        ],
        kdaAttributes: [],
        types: {},
      }

      const decoder = new ABIDecoder(mockABI)

      const returnData = ['RVRIUkNPSU4tMjJZUw==', 'RVRIR0dDT0lOLVdPQjE=']

      const results = decoder.decodeFunctionResults('getTokens', returnData)

      expect(results).toHaveLength(2)
      expect(results[0]).toBe('ETHRCOIN-22YS')
      expect(results[1]).toBe('ETHGGCOIN-WOB1')
    })
  })

  describe('multi-output endpoints (no variadic)', () => {
    it('should decode multiple separate outputs', () => {
      const mockABI: ContractABI = {
        buildInfo: {
          rustc: { version: '1.0', commitHash: '', commitDate: '', channel: 'Stable', short: '' },
          contractCrate: { name: 'test', version: '1.0' },
          framework: { name: 'klever-sc', version: '1.0' },
        },
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        upgradeConstructor: { name: 'upgrade', inputs: [], outputs: [] },
        endpoints: [
          {
            name: 'multi_result_4',
            mutability: 'mutable',
            inputs: [],
            outputs: [
              { name: 'multi-too-few-1', type: 'i32' },
              { name: 'multi-too-few-2', type: 'array3<u8>' },
              { type: 'bytes' },
              { type: 'OnlyShowsUpAsNested03' },
            ],
          },
        ],
        kdaAttributes: [],
        types: {
          OnlyShowsUpAsNested03: {
            type: 'struct',
            fields: [{ name: 'field1', type: 'u32' }],
          },
        },
      }

      const decoder = new ABIDecoder(mockABI)

      // Example data:
      // i32 = -100 (signed), array3<u8> = [1, 2, 3], bytes = [0xaa, 0xbb], struct = {field1: 42}
      const returnData = [
        encodeBase64(new Uint8Array([0xff, 0xff, 0xff, 0x9c])), // i32 = -100
        encodeBase64(new Uint8Array([0x01, 0x02, 0x03])), // array3<u8>
        encodeBase64(new Uint8Array([0xaa, 0xbb])), // bytes
        encodeBase64(new Uint8Array([0x00, 0x00, 0x00, 0x2a])), // struct {field1: 42}
      ]

      const result = decoder.decodeFunctionResultsWithMetadata('multi_result_4', returnData)

      expect(result.values).toHaveLength(4)

      // i32 = -100
      expect(result.values[0]?.type).toBe('i32')
      expect(result.values[0]?.value).toBe(-100)

      // array3<u8> = [1, 2, 3]
      expect(result.values[1]?.type).toBe('array3<u8>')
      expect(result.values[1]?.value).toEqual([1, 2, 3])

      // bytes = [0xaa, 0xbb]
      expect(result.values[2]?.type).toBe('bytes')
      expect(result.values[2]?.value).toEqual(new Uint8Array([0xaa, 0xbb]))

      // struct {field1: 42}
      expect(result.values[3]?.type).toBe('OnlyShowsUpAsNested03')
      const struct = result.values[3]?.value as any
      expect(struct.field1).toBe(42)
    })
  })
})
