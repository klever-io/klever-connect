/**
 * Tests for Contract Classes (Interface, Contract, ContractFactory)
 */

import { describe, expect, it } from 'vitest'
import { Interface } from '../interface'
import { Contract } from '../contract'
import { ContractFactory } from '../contract-factory'
import type { ContractABI } from '../types/abi'
import type { Provider, Signer } from '../contract'
import type { Transaction } from '@klever/connect-transactions'
import { loadABI } from '../utils'
import diceAbi from '../../examples/dice/dice.abi.json'

// Mock implementations for testing
const createMockProvider = (): Provider => ({
  queryContract: async () => ({}),
  sendRawTransaction: async () => 'mock-hash' as never,
  waitForTransaction: async () => null,
})

const createMockSigner = (provider?: Provider): Signer => ({
  address: 'klv1mock',
  signTransaction: async (tx: Transaction) => tx,
  provider: provider || createMockProvider(),
})

describe('Interface', () => {
  const abi = loadABI(diceAbi)

  describe('constructor', () => {
    it('should create interface from ABI object', () => {
      const iface = new Interface(abi)
      expect(iface.name).toBe('Dice')
      expect(iface.endpointCount).toBe(2)
    })

    it('should create interface from JSON string', () => {
      const jsonAbi = JSON.stringify(abi)
      const iface = new Interface(jsonAbi)
      expect(iface.name).toBe('Dice')
    })

    it('should validate ABI on construction', () => {
      const invalidAbi = { name: 'Test' }
      expect(() => new Interface(invalidAbi as ContractABI)).toThrow()
    })
  })

  describe('endpoint queries', () => {
    const iface = new Interface(abi)

    it('should get all endpoint names', () => {
      const names = iface.getEndpointNames()
      expect(names).toEqual(['getLastResult', 'bet'])
    })

    it('should get readonly endpoints', () => {
      const names = iface.getReadonlyEndpoints()
      expect(names).toEqual(['getLastResult'])
    })

    it('should get mutable endpoints', () => {
      const names = iface.getMutableEndpoints()
      expect(names).toEqual(['bet'])
    })

    it('should get endpoint definition', () => {
      const endpoint = iface.getEndpoint('bet')
      expect(endpoint.name).toBe('bet')
      expect(endpoint.inputs).toHaveLength(2)
      expect(endpoint.mutability).toBe('mutable')
    })

    it('should check if endpoint is readonly', () => {
      expect(iface.isReadonly('getLastResult')).toBe(true)
      expect(iface.isReadonly('bet')).toBe(false)
    })

    it('should check if endpoint is payable', () => {
      expect(iface.isPayable('bet')).toBe(true)
      expect(iface.isPayable('getLastResult')).toBe(false)
    })
  })

  describe('type queries', () => {
    const iface = new Interface(abi)

    it('should get type definition', () => {
      const betType = iface.getType('Bet')
      expect(betType.type).toBe('struct')
      expect(betType.fields).toHaveLength(5)
    })

    it('should check if type exists', () => {
      expect(iface.hasType('Bet')).toBe(true)
      expect(iface.hasType('NonExistent')).toBe(false)
    })

    it('should get all types', () => {
      const types = iface.getTypes()
      expect(Object.keys(types)).toEqual(['Bet', 'BetType'])
    })

    it('should get type count', () => {
      expect(iface.typeCount).toBe(2)
    })
  })

  describe('encoding', () => {
    const iface = new Interface(abi)

    it('should encode function call', async () => {
      const { encodeU32 } = await import('../encoder/param-encoder')
      const betType = encodeU32(0)
      const betValue = encodeU32(50)

      const encoded = iface.encodeFunctionCall('bet', [betType, betValue])
      expect(encoded).toBe('bet@00@32')
    })

    it('should encode constructor', () => {
      const encoded = iface.encodeConstructor([])
      expect(encoded).toBe('')
    })
  })

  describe('constructor info', () => {
    const iface = new Interface(abi)

    it('should get constructor definition', () => {
      const constructor = iface.getConstructor()
      expect(constructor.inputs).toHaveLength(0)
      expect(constructor.outputs).toHaveLength(0)
    })
  })

  describe('formatting', () => {
    const iface = new Interface(abi)

    it('should format ABI as JSON', () => {
      const json = iface.format()
      expect(json).toContain('"name": "Dice"')
      expect(json).toContain('"endpoints"')
    })
  })
})

describe('Contract', () => {
  const abi = loadABI(diceAbi)
  const contractAddress = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

  describe('constructor', () => {
    it('should create contract without signer/provider', () => {
      const contract = new Contract(contractAddress, abi)
      expect(contract.address).toBe(contractAddress)
      expect(contract.interface.name).toBe('Dice')
      expect(contract.signer).toBeUndefined()
      expect(contract.provider).toBeUndefined()
    })

    it('should create contract with provider', () => {
      const mockProvider = createMockProvider()
      const contract = new Contract(contractAddress, abi, mockProvider)
      expect(contract.provider).toBe(mockProvider)
      expect(contract.signer).toBeUndefined()
    })

    it('should create contract with signer', () => {
      const mockSigner = createMockSigner()

      const contract = new Contract(contractAddress, abi, mockSigner)
      expect(contract.signer).toBe(mockSigner)
      expect(contract.provider).toBe(mockSigner.provider)
    })
  })

  describe('dynamic methods', () => {
    it('should generate methods for all endpoints', () => {
      const contract = new Contract(contractAddress, abi)

      expect(typeof contract['getLastResult']).toBe('function')
      expect(typeof contract['bet']).toBe('function')
    })
  })

  describe('invoke method', () => {
    it('should throw when calling readonly function', async () => {
      const mockProvider = createMockProvider()
      const contract = new Contract(contractAddress, abi, mockProvider)

      await expect(contract.invoke('getLastResult')).rejects.toThrow(
        'Function getLastResult is readonly',
      )
    })

    it('should throw when function does not exist', async () => {
      const mockSigner = createMockSigner()
      const contract = new Contract(contractAddress, abi, mockSigner)

      await expect(contract.invoke('nonExistent')).rejects.toThrow(
        'Function nonExistent does not exist in contract',
      )
    })
  })

  describe('connect and attach', () => {
    it('should connect to new signer', () => {
      const contract = new Contract(contractAddress, abi)
      const mockSigner = createMockSigner()

      const connected = contract.connect(mockSigner)
      expect(connected.address).toBe(contractAddress)
      expect(connected.signer).toBe(mockSigner)
    })

    it('should attach to new address', () => {
      const contract = new Contract(contractAddress, abi)
      const newAddress = 'klv1different'

      const attached = contract.attach(newAddress)
      expect(attached.address).toBe(newAddress)
      expect(attached.interface.name).toBe('Dice')
    })
  })

  describe('toString', () => {
    it('should return contract info', () => {
      const contract = new Contract(contractAddress, abi)
      const str = contract.toString()
      expect(str).toContain(contractAddress)
    })
  })
})

describe('ContractFactory', () => {
  const abi = loadABI(diceAbi)
  const bytecode = new Uint8Array([0x01, 0x02, 0x03])
  const mockSigner = createMockSigner()

  describe('constructor', () => {
    it('should create factory with Uint8Array bytecode', () => {
      const factory = new ContractFactory(abi, bytecode, mockSigner)
      expect(factory.interface.name).toBe('Dice')
      expect(factory.bytecode).toEqual(bytecode)
      expect(factory.signer).toBe(mockSigner)
    })

    it('should create factory with hex string bytecode', () => {
      const hexBytecode = '010203'
      const factory = new ContractFactory(abi, hexBytecode, mockSigner)
      expect(Array.from(factory.bytecode)).toEqual([1, 2, 3])
    })

    it('should handle 0x prefix in hex bytecode', () => {
      const hexBytecode = '0x010203'
      const factory = new ContractFactory(abi, hexBytecode, mockSigner)
      expect(Array.from(factory.bytecode)).toEqual([1, 2, 3])
    })
  })

  describe('attach', () => {
    it('should attach to existing contract', () => {
      const factory = new ContractFactory(abi, bytecode, mockSigner)
      const address = 'klv1test'

      const contract = factory.attach(address)
      expect(contract.address).toBe(address)
      expect(contract.signer).toBe(mockSigner)
    })
  })

  describe('connect', () => {
    it('should connect to new signer', () => {
      const factory = new ContractFactory(abi, bytecode, mockSigner)
      const newSigner = createMockSigner()

      const newFactory = factory.connect(newSigner)
      expect(newFactory.signer).toBe(newSigner)
      expect(newFactory.bytecode).toEqual(bytecode)
    })
  })

  describe('getDeployTransaction', () => {
    it('should get deployment data with no constructor args', () => {
      const factory = new ContractFactory(abi, bytecode, mockSigner)
      const deployTx = factory.getDeployTransaction()

      expect(deployTx.data).toBe('010203')
    })

    it('should get deployment data with constructor args', async () => {
      const { encodeU32 } = await import('../encoder/param-encoder')

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

      const factory = new ContractFactory(testAbi, bytecode, mockSigner)
      const arg = encodeU32(42)
      const deployTx = factory.getDeployTransaction(arg)

      // Should contain bytecode + @2a (42 in hex)
      expect(deployTx.data).toContain('010203')
      expect(deployTx.data).toContain('2a')
    })
  })
})
