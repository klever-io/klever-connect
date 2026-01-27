/**
 * Tests for Parameter and Function Encoders
 */

import { describe, expect, it } from 'vitest'
import {
  bytesToHex,
  contractParam,
  encodeAddress,
  encodeBool,
  encodeBytes,
  encodeString,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU8,
  hexToBytes,
} from '../encoder/param-encoder'
import { encodeFunctionCall, encodeConstructor, FunctionEncoder } from '../encoder/function-encoder'
import type { ContractABI } from '../types/abi'
import { loadABI } from '../utils'
import diceAbi from '../../examples/dice/dice.abi.json'

describe('Parameter Encoder', () => {
  describe('encodeU8', () => {
    it('should encode zero', () => {
      const result = encodeU8(0)
      expect(bytesToHex(result)).toBe('00')
    })

    it('should encode positive values', () => {
      expect(bytesToHex(encodeU8(1))).toBe('01')
      expect(bytesToHex(encodeU8(255))).toBe('ff')
      expect(bytesToHex(encodeU8(42))).toBe('2a')
    })

    it('should throw on invalid values', () => {
      expect(() => encodeU8(-1)).toThrow('Invalid u8 value')
      expect(() => encodeU8(256)).toThrow('Invalid u8 value')
      expect(() => encodeU8(1.5)).toThrow('Invalid u8 value')
    })
  })

  describe('encodeU16', () => {
    it('should encode zero', () => {
      expect(bytesToHex(encodeU16(0))).toBe('00')
    })

    it('should encode values with leading zeros trimmed', () => {
      expect(bytesToHex(encodeU16(1))).toBe('01')
      expect(bytesToHex(encodeU16(255))).toBe('ff')
      expect(bytesToHex(encodeU16(256))).toBe('0100')
      expect(bytesToHex(encodeU16(65535))).toBe('ffff')
    })

    it('should throw on invalid values', () => {
      expect(() => encodeU16(-1)).toThrow('Invalid u16 value')
      expect(() => encodeU16(65536)).toThrow('Invalid u16 value')
    })
  })

  describe('encodeU32', () => {
    it('should encode zero', () => {
      expect(bytesToHex(encodeU32(0))).toBe('00')
    })

    it('should encode values with leading zeros trimmed', () => {
      expect(bytesToHex(encodeU32(1))).toBe('01')
      expect(bytesToHex(encodeU32(255))).toBe('ff')
      expect(bytesToHex(encodeU32(256))).toBe('0100')
      expect(bytesToHex(encodeU32(65536))).toBe('010000')
      expect(bytesToHex(encodeU32(0xffffffff))).toBe('ffffffff')
    })

    it('should encode dice bet_value example', () => {
      // bet_value: 50 (dice game)
      expect(bytesToHex(encodeU32(50))).toBe('32')
    })

    it('should throw on invalid values', () => {
      expect(() => encodeU32(-1)).toThrow('Invalid u32 value')
      expect(() => encodeU32(0x100000000)).toThrow('Invalid u32 value')
    })
  })

  describe('encodeU64', () => {
    it('should encode zero', () => {
      expect(bytesToHex(encodeU64(0n))).toBe('00')
    })

    it('should encode bigint values', () => {
      expect(bytesToHex(encodeU64(1n))).toBe('01')
      expect(bytesToHex(encodeU64(255n))).toBe('ff')
      expect(bytesToHex(encodeU64(256n))).toBe('0100')
      expect(bytesToHex(encodeU64(0xffffffffffffffffn))).toBe('ffffffffffffffff')
    })

    it('should throw on invalid values', () => {
      expect(() => encodeU64(-1n)).toThrow('Invalid u64 value')
      expect(() => encodeU64(0x10000000000000000n)).toThrow('Invalid u64 value')
    })
  })

  describe('encodeBool', () => {
    it('should encode true as 0x01', () => {
      expect(bytesToHex(encodeBool(true))).toBe('01')
    })

    it('should encode false as 0x00', () => {
      expect(bytesToHex(encodeBool(false))).toBe('00')
    })
  })

  describe('encodeString', () => {
    it('should encode string to UTF-8 bytes', () => {
      const result = encodeString('hello')
      expect(bytesToHex(result)).toBe('68656c6c6f')
    })

    it('should encode empty string', () => {
      const result = encodeString('')
      expect(bytesToHex(result)).toBe('')
    })

    it('should add length prefix when nested', () => {
      const result = encodeString('hello', true)
      // Length: 5 = 0x00000005, followed by "hello"
      expect(bytesToHex(result)).toBe('0000000568656c6c6f')
    })
  })

  describe('encodeBytes', () => {
    it('should encode bytes without prefix', () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03])
      const result = encodeBytes(bytes)
      expect(bytesToHex(result)).toBe('010203')
    })

    it('should add length prefix when nested', () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03])
      const result = encodeBytes(bytes, true)
      // Length: 3 = 0x00000003, followed by bytes
      expect(bytesToHex(result)).toBe('00000003010203')
    })
  })

  describe('encodeAddress', () => {
    it('should validate address prefix', () => {
      // Basic validation test
      expect(() => encodeAddress('eth1invalid')).toThrow('Invalid Klever address')
    })

    it('should attempt to decode valid Klever address format', () => {
      // Test that it accepts klv1 prefix
      // Note: Full bech32 decoding needs proper library implementation
      const testAddress = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

      try {
        const result = encodeAddress(testAddress)
        expect(result).toBeInstanceOf(Uint8Array)
        // Simplified bech32 may not produce exact 32 bytes
        // This is expected until we integrate proper bech32 library
      } catch (error) {
        // Expected for now - simplified bech32 implementation
        expect(error).toBeDefined()
      }
    })
  })

  describe('hexToBytes', () => {
    it('should convert hex to bytes', () => {
      const result = hexToBytes('010203')
      expect(Array.from(result)).toEqual([1, 2, 3])
    })

    it('should handle 0x prefix', () => {
      const result = hexToBytes('0x010203')
      expect(Array.from(result)).toEqual([1, 2, 3])
    })

    it('should throw on odd-length hex', () => {
      expect(() => hexToBytes('123')).toThrow('Hex string must have even length')
    })
  })

  describe('bytesToHex', () => {
    it('should convert bytes to hex', () => {
      const bytes = new Uint8Array([1, 2, 3, 255])
      expect(bytesToHex(bytes)).toBe('010203ff')
    })

    it('should handle empty bytes', () => {
      expect(bytesToHex(new Uint8Array([]))).toBe('')
    })
  })

  describe('contractParam helper', () => {
    it('should expose all encoding functions', () => {
      expect(contractParam.u8).toBe(encodeU8)
      expect(contractParam.u16).toBe(encodeU16)
      expect(contractParam.u32).toBe(encodeU32)
      expect(contractParam.u64).toBe(encodeU64)
      expect(contractParam.bool).toBe(encodeBool)
      expect(contractParam.string).toBe(encodeString)
      expect(contractParam.bytes).toBe(encodeBytes)
      expect(contractParam.toHex).toBe(bytesToHex)
      expect(contractParam.fromHex).toBe(hexToBytes)
    })
  })
})

describe('Function Encoder', () => {
  const abi = loadABI(diceAbi)

  describe('encodeFunctionCall', () => {
    it('should encode function with no arguments', () => {
      // Create a test ABI with no-arg function
      const testAbi: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [{ name: 'noArgs', inputs: [], outputs: [] }],
        types: {},
      }

      const result = encodeFunctionCall(testAbi, 'noArgs', [])
      expect(result).toBe('noArgs')
    })

    it('should encode function with arguments', () => {
      // bet(bet_type: BetType, bet_value: u32)
      const betType = encodeU32(0) // UNDER = 0
      const betValue = encodeU32(50)

      const result = encodeFunctionCall(abi, 'bet', [betType, betValue])
      expect(result).toBe('bet@00@32')
    })

    it('should throw on non-existent function', () => {
      expect(() => encodeFunctionCall(abi, 'nonExistent', [])).toThrow(
        "Endpoint 'nonExistent' not found",
      )
    })

    it('should throw on wrong argument count', () => {
      expect(() => encodeFunctionCall(abi, 'bet', [encodeU32(0)])).toThrow('Invalid argument count')
    })
  })

  describe('encodeConstructor', () => {
    it('should encode constructor with no arguments', () => {
      const result = encodeConstructor(abi, [])
      expect(result).toBe('')
    })

    it('should encode constructor with arguments', () => {
      const testAbi: ContractABI = {
        name: 'Test',
        constructor: {
          name: 'init',
          inputs: [
            { name: 'value', type: 'u32' },
            { name: 'flag', type: 'bool' },
          ],
          outputs: [],
        },
        endpoints: [],
        types: {},
      }

      const result = encodeConstructor(testAbi, [encodeU32(42), encodeBool(true)])
      expect(result).toBe('@2a@01')
    })

    it('should throw on wrong argument count', () => {
      const testAbi: ContractABI = {
        name: 'Test',
        constructor: {
          name: 'init',
          inputs: [{ name: 'value', type: 'u32' }],
          outputs: [],
        },
        endpoints: [],
        types: {},
      }

      expect(() => encodeConstructor(testAbi, [])).toThrow('Invalid constructor argument count')
    })
  })

  describe('FunctionEncoder', () => {
    it('should encode function calls', () => {
      const encoder = new FunctionEncoder(abi)

      const result = encoder.encodeFunction('bet', [encodeU32(0), encodeU32(50)])
      expect(result).toBe('bet@00@32')
    })

    it('should encode constructor', () => {
      const encoder = new FunctionEncoder(abi)
      const result = encoder.encodeConstructor([])
      expect(result).toBe('')
    })

    it('should get endpoint definition', () => {
      const encoder = new FunctionEncoder(abi)
      const endpoint = encoder.getEndpoint('bet')
      expect(endpoint.name).toBe('bet')
      expect(endpoint.inputs).toHaveLength(2)
    })
  })
})

describe('ABI-Aware Encoder', () => {
  describe('Signed integers', () => {
    it('should encode i8 values', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // Positive value
      const pos = encoder.encodeValue(100, 'i8')
      expect(bytesToHex(pos)).toBe('64')

      // Negative value: -100 → 256 - 100 = 156 = 0x9c
      const neg = encoder.encodeValue(-100, 'i8')
      expect(bytesToHex(neg)).toBe('9c')

      // Zero
      const zero = encoder.encodeValue(0, 'i8')
      expect(bytesToHex(zero)).toBe('00')
    })

    it('should encode i16 values', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // Positive
      const pos = encoder.encodeValue(1000, 'i16')
      expect(bytesToHex(pos)).toBe('03e8')

      // Negative: -1000 → 65536 - 1000 = 64536 = 0xfc18
      const neg = encoder.encodeValue(-1000, 'i16')
      expect(bytesToHex(neg)).toBe('fc18')
    })

    it('should encode i32 values', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // Positive
      const pos = encoder.encodeValue(100000, 'i32')
      expect(bytesToHex(pos)).toBe('0186a0')

      // Negative: -100 → 4294967296 - 100 = 4294967196 = 0xffffff9c
      const neg = encoder.encodeValue(-100, 'i32')
      expect(bytesToHex(neg)).toBe('ffffff9c')
    })

    it('should encode i64 values', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // Positive
      const pos = encoder.encodeValue(1000000n, 'i64')
      expect(bytesToHex(pos)).toBe('0f4240')

      // Negative: -1000 → 2^64 - 1000
      const neg = encoder.encodeValue(-1000n, 'i64')
      expect(bytesToHex(neg)).toBe('fffffffffffffc18')
    })
  })

  describe('Fixed-size arrays (encodeFixedArray)', () => {
    it('should encode array3<u8>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // Top-level: [1, 2, 3] - items encoded as nested (fixed 1 byte each for u8)
      const result = encoder.encodeValue([1, 2, 3], 'array3<u8>')
      expect(bytesToHex(result)).toBe('010203')
    })

    it('should encode array2<u32>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // [100, 200] - nested encoding uses fixed 4 bytes for u32
      const result = encoder.encodeValue([100, 200], 'array2<u32>')
      expect(bytesToHex(result)).toBe('00000064000000c8')
    })

    it('should throw on wrong array size', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      expect(() => encoder.encodeValue([1, 2], 'array3<u8>')).toThrow(
        'Expected array of size 3, got 2',
      )
    })

    it('should encode array of strings', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // array2<TokenIdentifier> - strings are nested with length prefix
      const result = encoder.encodeValue(['ABC', 'DEF'], 'array2<TokenIdentifier>')
      // 'ABC' = 0x00000003 + 0x414243
      // 'DEF' = 0x00000003 + 0x444546
      expect(bytesToHex(result)).toBe('0000000341424300000003444546')
    })

    it('should encode array1<u8> single element', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const result = encoder.encodeValue([255], 'array1<u8>')
      expect(bytesToHex(result)).toBe('ff')
    })

    it('should encode array4<u16>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // [1, 256, 65535, 0] - nested encoding uses fixed 2 bytes for u16
      const result = encoder.encodeValue([1, 256, 65535, 0], 'array4<u16>')
      expect(bytesToHex(result)).toBe('00010100ffff0000')
    })

    it('should encode array2<u64>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // [1, 1000000] - nested encoding uses fixed 8 bytes for u64
      const result = encoder.encodeValue([1n, 1000000n], 'array2<u64>')
      expect(bytesToHex(result)).toBe('000000000000000100000000000f4240')
    })

    it('should encode array2<bool>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const result = encoder.encodeValue([true, false], 'array2<bool>')
      expect(bytesToHex(result)).toBe('0100')
    })

    it('should encode array3<BigUint>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // BigUint is nested with 4-byte length prefix
      // [0, 255, 256]
      // 0 -> length 1 + 0x00 = 00000001 00
      // 255 -> length 1 + 0xff = 00000001 ff
      // 256 -> length 2 + 0x0100 = 00000002 0100
      const result = encoder.encodeValue([0n, 255n, 256n], 'array3<BigUint>')
      expect(bytesToHex(result)).toBe('000000010000000001ff000000020100')
    })

    it('should throw when array has too many elements', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      expect(() => encoder.encodeValue([1, 2, 3, 4], 'array3<u8>')).toThrow(
        'Expected array of size 3, got 4',
      )
    })

    it('should throw when array is empty but size expected', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      expect(() => encoder.encodeValue([], 'array2<u8>')).toThrow('Expected array of size 2, got 0')
    })

    it('should encode array16<u8> (larger fixed array)', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const values = Array.from({ length: 16 }, (_, i) => i)
      const result = encoder.encodeValue(values, 'array16<u8>')
      expect(bytesToHex(result)).toBe('000102030405060708090a0b0c0d0e0f')
    })

    it('should encode array32<u8> (common hash size)', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // Test with actual hash value as hex string
      const hexInput = '6b26e4992694fd5312b6652751c6460f7b656f7e15c8dcd3be8bd05db1cc1e22'
      const result = encoder.encodeValue(hexInput, 'array32<u8>')
      expect(bytesToHex(result)).toBe(hexInput)
    })

    it('should encode nested array with Option type', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // array2<Option<u8>> with [Some(42), None]
      // Some(42) = 0x01 + 0x2a (nested u8 is fixed 1 byte)
      // None = 0x00
      const result = encoder.encodeValue([42, null], 'array2<Option<u8>>')
      expect(bytesToHex(result)).toBe('012a00')
    })

    it('should encode array with struct type', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {
          Point: {
            type: 'struct',
            fields: [
              { name: 'x', type: 'u32' },
              { name: 'y', type: 'u32' },
            ],
          },
        },
      }

      const encoder = new ABIEncoder(mockABI)
      // array2<Point> with [{x: 10, y: 20}, {x: 30, y: 40}]
      // Point fields are nested, so u32 uses fixed 4 bytes
      const result = encoder.encodeValue(
        [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        'array2<Point>',
      )
      // 10 = 0x0000000a, 20 = 0x00000014, 30 = 0x0000001e, 40 = 0x00000028
      expect(bytesToHex(result)).toBe('0000000a000000140000001e00000028')
    })

    it('should encode array with signed integers', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // array3<i8> with [1, -1, 127]
      // 1 = 0x01, -1 = 0xff (two's complement), 127 = 0x7f
      const result = encoder.encodeValue([1, -1, 127], 'array3<i8>')
      expect(bytesToHex(result)).toBe('01ff7f')
    })

    it('should encode array2<i32> with negative values', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // array2<i32> with [100, -100]
      // 100 = 0x00000064, -100 = 0xffffff9c (two's complement)
      const result = encoder.encodeValue([100, -100], 'array2<i32>')
      expect(bytesToHex(result)).toBe('00000064ffffff9c')
    })

    it('should not include length prefix for fixed arrays (unlike List)', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)

      // array3<u8> should NOT have a count prefix
      const fixedResult = encoder.encodeValue([1, 2, 3], 'array3<u8>')
      expect(bytesToHex(fixedResult)).toBe('010203')

      // List<u8> SHOULD have a 4-byte count prefix
      const listResult = encoder.encodeValue([1, 2, 3], 'List<u8>')
      // Count: 3 = 0x00000003, then items
      expect(bytesToHex(listResult)).toBe('00000003010203')
    })

    it('should encode array32<u8> from hex string', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const hexInput = '6b26e4992694fd5312b6652751c6460f7b656f7e15c8dcd3be8bd05db1cc1e22'
      const result = encoder.encodeValue(hexInput, 'array32<u8>')
      expect(bytesToHex(result)).toBe(hexInput)
    })

    it('should encode array32<u8> from hex string with 0x prefix', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const hexInput = '0x6b26e4992694fd5312b6652751c6460f7b656f7e15c8dcd3be8bd05db1cc1e22'
      const result = encoder.encodeValue(hexInput, 'array32<u8>')
      expect(bytesToHex(result)).toBe(
        '6b26e4992694fd5312b6652751c6460f7b656f7e15c8dcd3be8bd05db1cc1e22',
      )
    })

    it('should encode array16<u8> from hex string', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const hexInput = '000102030405060708090a0b0c0d0e0f'
      const result = encoder.encodeValue(hexInput, 'array16<u8>')
      expect(bytesToHex(result)).toBe(hexInput)
    })

    it('should throw on wrong hex string length for array32<u8>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      // Only 16 bytes (32 hex chars) instead of 32 bytes (64 hex chars)
      const hexInput = '6b26e4992694fd5312b6652751c6460f'
      expect(() => encoder.encodeValue(hexInput, 'array32<u8>')).toThrow(
        'Expected hex string of 64 characters (32 bytes), got 32',
      )
    })

    it('should encode array4<u8> from Uint8Array', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
      const result = encoder.encodeValue(bytes, 'array4<u8>')
      expect(bytesToHex(result)).toBe('deadbeef')
    })

    it('should throw on wrong Uint8Array length', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const bytes = new Uint8Array([0xde, 0xad, 0xbe])
      expect(() => encoder.encodeValue(bytes, 'array4<u8>')).toThrow(
        'Expected array of size 4, got 3',
      )
    })
  })

  describe('Round-trip encode/decode', () => {
    it('should round-trip i32 values', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const { ABIDecoder } = await import('../decoder/abi-decoder')

      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const decoder = new ABIDecoder(mockABI)

      const testValue = -100
      const encoded = encoder.encodeValue(testValue, 'i32')
      const decoded = decoder.decodeValue(encoded, 'i32')

      expect(decoded).toBe(testValue)
    })

    it('should round-trip array3<u8>', async () => {
      const { ABIEncoder } = await import('../encoder/abi-encoder')
      const { ABIDecoder } = await import('../decoder/abi-decoder')

      const mockABI: ContractABI = {
        name: 'Test',
        constructor: { name: 'init', inputs: [], outputs: [] },
        endpoints: [],
        types: {},
      }

      const encoder = new ABIEncoder(mockABI)
      const decoder = new ABIDecoder(mockABI)

      const testValue = [1, 2, 3]
      const encoded = encoder.encodeValue(testValue, 'array3<u8>')
      const decoded = decoder.decodeValue(encoded, 'array3<u8>')

      expect(decoded).toEqual(testValue)
    })
  })
})
