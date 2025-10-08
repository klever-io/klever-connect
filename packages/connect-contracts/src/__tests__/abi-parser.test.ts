/**
 * Tests for ABI Parser and Validator
 */

import { describe, expect, it } from 'vitest'
import { ABIParser } from '../abi/parser'
import { ABIValidator } from '../abi/validator'
import type { ContractABI } from '../types/abi'

// Load Dice contract ABI for testing
import { loadABI } from '../utils'
import diceAbi from '../../examples/dice/dice.abi.json'

describe('ABIParser', () => {
  describe('parse', () => {
    it('should parse valid ABI object', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      expect(abi.name).toBe('Dice')
      expect(abi.endpoints).toHaveLength(2)
      expect(abi.types).toBeDefined()
    })

    it('should parse valid ABI JSON string', () => {
      const abiString = JSON.stringify(diceAbi)
      const abi = ABIParser.parse(abiString)
      expect(abi.name).toBe('Dice')
    })

    it('should throw on missing name', () => {
      const invalidAbi = { endpoints: [] }
      expect(() => ABIParser.parse(invalidAbi as unknown as ContractABI)).toThrow(
        'ABI missing contract name',
      )
    })

    it('should throw on missing endpoints', () => {
      const invalidAbi = { name: 'Test' }
      expect(() => ABIParser.parse(invalidAbi as ContractABI)).toThrow('ABI missing endpoints')
    })

    it('should initialize empty types if missing', () => {
      const minimalAbi = {
        name: 'Test',
        endpoints: [],
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      const abi = ABIParser.parse(minimalAbi as unknown as ContractABI)
      expect(abi.types).toEqual({})
    })
  })

  describe('getEndpoint', () => {
    it('should get endpoint by name', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const endpoint = ABIParser.getEndpoint(abi, 'getLastResult')
      expect(endpoint.name).toBe('getLastResult')
      expect(endpoint.mutability).toBe('readonly')
    })

    it('should throw on non-existent endpoint', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      expect(() => ABIParser.getEndpoint(abi, 'nonExistent')).toThrow(
        "Endpoint 'nonExistent' not found in ABI",
      )
    })
  })

  describe('getType', () => {
    it('should get type by name', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const betType = ABIParser.getType(abi, 'Bet')
      expect(betType.type).toBe('struct')
      expect(betType.fields).toHaveLength(5)
    })

    it('should throw on non-existent type', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      expect(() => ABIParser.getType(abi, 'NonExistent')).toThrow(
        "Type 'NonExistent' not found in ABI",
      )
    })
  })

  describe('isReadonly', () => {
    it('should identify readonly endpoints', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const endpoint = ABIParser.getEndpoint(abi, 'getLastResult')
      expect(ABIParser.isReadonly(endpoint)).toBe(true)
    })

    it('should identify mutable endpoints', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const endpoint = ABIParser.getEndpoint(abi, 'bet')
      expect(ABIParser.isReadonly(endpoint)).toBe(false)
    })
  })

  describe('isPayable', () => {
    it('should identify payable endpoints', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const endpoint = ABIParser.getEndpoint(abi, 'bet')
      expect(ABIParser.isPayable(endpoint)).toBe(true)
    })

    it('should identify non-payable endpoints', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const endpoint = ABIParser.getEndpoint(abi, 'getLastResult')
      expect(ABIParser.isPayable(endpoint)).toBe(false)
    })
  })

  describe('getEndpointNames', () => {
    it('should return all endpoint names', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const names = ABIParser.getEndpointNames(abi)
      expect(names).toEqual(['getLastResult', 'bet'])
    })
  })

  describe('getReadonlyEndpoints', () => {
    it('should return only readonly endpoint names', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const names = ABIParser.getReadonlyEndpoints(abi)
      expect(names).toEqual(['getLastResult'])
    })
  })

  describe('getMutableEndpoints', () => {
    it('should return only mutable endpoint names', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const names = ABIParser.getMutableEndpoints(abi)
      expect(names).toEqual(['bet'])
    })
  })
})

describe('ABIValidator', () => {
  describe('validate', () => {
    it('should validate Dice ABI', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      expect(() => ABIValidator.validate(abi)).not.toThrow()
    })

    it('should throw on missing name', () => {
      const invalidAbi = {
        endpoints: [],
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: name must be a string',
      )
    })

    it('should throw on invalid name type', () => {
      const invalidAbi = {
        name: 123,
        endpoints: [],
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: name must be a string',
      )
    })

    it('should throw on missing constructor', () => {
      const invalidAbi = { name: 'Test', endpoints: [], types: {} }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: constructor must be an object',
      )
    })

    it('should throw on non-array endpoints', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: {},
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: endpoints must be an array',
      )
    })

    it('should throw on missing endpoint inputs', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: [{ name: 'test', outputs: [] }],
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: test inputs must be an array',
      )
    })

    it('should throw on missing endpoint outputs', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: [{ name: 'test', inputs: [] }],
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: test outputs must be an array',
      )
    })

    it('should throw on invalid mutability', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: [{ name: 'test', mutability: 'invalid', inputs: [], outputs: [] }],
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        "Invalid ABI: test mutability must be 'readonly' or 'mutable'",
      )
    })

    it('should throw on invalid parameter type', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: [{ name: 'test', inputs: [{ name: 'param' }], outputs: [] }],
        types: {},
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        'Invalid ABI: test input[0] must have a string type',
      )
    })

    it('should throw on invalid struct fields', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: [],
        types: {
          TestStruct: {
            type: 'struct',
            fields: 'invalid',
          },
        },
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        "Invalid ABI: struct 'TestStruct' must have fields array",
      )
    })

    it('should throw on invalid enum variants', () => {
      const invalidAbi = {
        name: 'Test',
        endpoints: [],
        types: {
          TestEnum: {
            type: 'enum',
            variants: 'invalid',
          },
        },
        constructor: { name: 'init', inputs: [], outputs: [] },
      }
      expect(() => ABIValidator.validate(invalidAbi as unknown as ContractABI)).toThrow(
        "Invalid ABI: enum 'TestEnum' must have variants array",
      )
    })

    it('should validate struct fields', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const betType = ABIParser.getType(abi, 'Bet')
      expect(betType.fields).toHaveLength(5)
      expect(betType.fields?.[0].name).toBe('bet_type')
      expect(betType.fields?.[0].type).toBe('u32')
    })

    it('should validate enum variants', () => {
      const abi = ABIParser.parse(loadABI(diceAbi))
      const betTypeEnum = ABIParser.getType(abi, 'BetType')
      expect(betTypeEnum.variants).toHaveLength(2)
      expect(betTypeEnum.variants?.[0].name).toBe('UNDER')
      expect(betTypeEnum.variants?.[0].discriminant).toBe(0)
    })
  })
})
