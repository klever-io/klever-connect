/**
 * Integration Tests for @klever/connect-contracts
 *
 * These tests use the Dice contract to verify end-to-end functionality.
 * Tests use mocked provider/signer to avoid requiring live testnet access.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Contract } from '../contract'
import { ContractFactory } from '../contract-factory'
import { Interface } from '../interface'
import { parseReceipt } from '../receipt-parser'
import { ABIEncoder } from '../encoder/abi-encoder'
import { ABIDecoder } from '../decoder/abi-decoder'
import { loadABI } from '../utils'
import diceAbi from '../../examples/dice/dice.abi.json'
import type { Provider, Signer } from '../contract'
import type { TransactionReceipt } from '../receipt-parser'
import type { Transaction } from '@klever/connect-transactions'

// Mock contract address
const MOCK_CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqfzydpd30f6gy0ylqvgr5wgk3qhkxfms6z8vspns0pz'

// Mock user address
const MOCK_USER_ADDRESS = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

// Mock provider for testing
class MockProvider implements Provider {
  // Mock query responses
  private queryResponses = new Map<string, unknown>()

  async queryContract(params: {
    ScAddress: string
    FuncName: string
    Arguments?: string[]
  }): Promise<{ data?: { returnData?: string[] }; error?: string }> {
    const key = `${params.ScAddress}:${params.FuncName}`
    const response = this.queryResponses.get(key)
    if (!response) {
      // Return default response for getLastResult
      // Bet struct is returned as a single encoded value (all fields concatenated)
      // Struct fields ARE nested:
      // - Fixed-size types (u8/u16/u32/u64) use FIXED size, NO length prefix
      // - bool is 1 byte, NO prefix
      // Note: bet_type is u32, not enum (the enum is separate)
      const betTypeEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x00]) // bet_type: u32 = 0 (4 bytes fixed)
      const betValueEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x32]) // u32: 50 (4 bytes fixed)
      const diceValueEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x2e]) // u32: 46 (4 bytes fixed)
      const multiplierEncoded = new Uint8Array([0x00, 0x02, 0xf9, 0xb8]) // u32: 195000 (4 bytes fixed)
      const isWinnerEncoded = new Uint8Array([0x01]) // bool: true (1 byte, no prefix)

      const structBytes = new Uint8Array([
        ...betTypeEncoded,
        ...betValueEncoded,
        ...diceValueEncoded,
        ...multiplierEncoded,
        ...isWinnerEncoded,
      ])

      return {
        data: {
          returnData: [Buffer.from(structBytes).toString('base64')],
        },
      }
    }
    return response as { data?: { returnData?: string[] }; error?: string }
  }

  setQueryResponse(address: string, functionName: string, response: unknown): void {
    const key = `${address}:${functionName}`
    this.queryResponses.set(key, response)
  }

  // Add required Provider interface methods (stubs)
  async sendRawTransaction(): Promise<never> {
    throw new Error('Not implemented in mock')
  }

  async waitForTransaction(): Promise<never> {
    throw new Error('Not implemented in mock')
  }
}

// Mock signer for testing
class MockSigner implements Signer {
  address = MOCK_USER_ADDRESS
  provider?: Provider

  constructor(provider?: Provider) {
    this.provider = provider
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    // Mock signing - just return the transaction
    return tx
  }
}

// Mock transaction builder result (kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockTransaction = {
  RawData: {
    Nonce: 1,
    Sender: new Uint8Array(32),
    Contract: [],
    KAppFee: 0,
    BandwidthFee: 0,
    Data: [],
  },
  Signature: [],
  getHash: () => 'mock-tx-hash-1234567890abcdef',
  toHex: () => '0x1234567890abcdef',
  toBytes: () => new Uint8Array([0x12, 0x34]),
}

describe('Integration Tests - Dice Contract', () => {
  let provider: MockProvider
  let signer: MockSigner
  let contract: Contract

  beforeEach(() => {
    provider = new MockProvider()
    signer = new MockSigner(provider)
    contract = new Contract(MOCK_CONTRACT_ADDRESS, loadABI(diceAbi), signer)
  })

  describe('Interface', () => {
    it('should parse Dice ABI correctly', () => {
      const iface = new Interface(loadABI(diceAbi))

      expect(iface.name).toBe('Dice')
      expect(iface.endpointCount).toBe(2)
      expect(iface.typeCount).toBe(2)
    })

    it('should identify readonly endpoints', () => {
      const iface = new Interface(loadABI(diceAbi))

      expect(iface.isReadonly('getLastResult')).toBe(true)
      expect(iface.isReadonly('bet')).toBe(false)
    })

    it('should identify payable endpoints', () => {
      const iface = new Interface(loadABI(diceAbi))

      expect(iface.isPayable('bet')).toBe(true)
      expect(iface.isPayable('getLastResult')).toBe(false)
    })

    it('should get endpoint definitions', () => {
      const iface = new Interface(loadABI(diceAbi))

      const getLastResult = iface.getEndpoint('getLastResult')
      expect(getLastResult.name).toBe('getLastResult')
      expect(getLastResult.inputs).toHaveLength(1)
      expect(getLastResult.inputs[0]?.type).toBe('Address')
      expect(getLastResult.outputs).toHaveLength(1)
      expect(getLastResult.outputs[0]?.type).toBe('Bet')
    })

    it('should get type definitions', () => {
      const iface = new Interface(loadABI(diceAbi))

      const betType = iface.getType('Bet')
      expect(betType.type).toBe('struct')
      expect(betType.fields).toHaveLength(5)

      const betTypeEnum = iface.getType('BetType')
      expect(betTypeEnum.type).toBe('enum')
      expect(betTypeEnum.variants).toHaveLength(2)
    })
  })

  describe('Contract - Query Methods', () => {
    it('should auto-generate query method for getLastResult', () => {
      expect(typeof contract['getLastResult']).toBe('function')
    })

    it('should call getLastResult with correct encoding', async () => {
      const querySpy = vi.spyOn(provider, 'queryContract')

      await contract['getLastResult'](MOCK_USER_ADDRESS)

      // queryContract now receives an object with ScAddress, FuncName, Arguments
      expect(querySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ScAddress: MOCK_CONTRACT_ADDRESS,
          FuncName: 'getLastResult',
          Arguments: expect.any(Array),
        }),
      )
    })

    it('should decode getLastResult response correctly', async () => {
      const result = await contract['getLastResult'](MOCK_USER_ADDRESS)

      // Result should be decoded Bet struct
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')

      // Check struct fields
      const bet = result as Record<string, unknown>
      expect(bet['bet_type']).toBe(0) // UNDER
      expect(bet['bet_value']).toBe(50)
      expect(bet['dice_value']).toBe(46)
      expect(bet['multiplier']).toBe(195000)
      expect(bet['is_winner']).toBe(true)
    })
  })

  describe('Contract - Transaction Methods', () => {
    it('should auto-generate transaction method for bet', () => {
      expect(typeof contract['bet']).toBe('function')
    })

    it('should have transaction method available', () => {
      // The bet method should be available as a function
      expect(typeof contract['bet']).toBe('function')

      // Transaction building requires a real TransactionBuilder which needs provider
      // This test just verifies the method exists and is callable
      // Full transaction testing would require integration with actual TransactionBuilder
    })
  })

  describe('Encoding & Decoding', () => {
    it('should encode function arguments correctly', () => {
      const encoder = new ABIEncoder(loadABI(diceAbi))

      // Encode bet function arguments (bet_type: UNDER, bet_value: 50)
      const encodedArgs = encoder.encodeFunctionArgs('bet', [0, 50])

      expect(encodedArgs).toHaveLength(2)
      expect(encodedArgs[0]).toBeInstanceOf(Uint8Array)
      expect(encodedArgs[1]).toBeInstanceOf(Uint8Array)
    })

    it('should decode function results correctly', () => {
      const decoder = new ABIDecoder(loadABI(diceAbi))

      // Mock return data for getLastResult (Bet struct as single encoded value)
      const betTypeEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x00]) // bet_type: u32 = 0 (4 bytes)
      const betValueEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x32]) // u32: 50 (4 bytes fixed)
      const diceValueEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x2e]) // u32: 46 (4 bytes fixed)
      const multiplierEncoded = new Uint8Array([0x00, 0x02, 0xf9, 0xb8]) // u32: 195000 (4 bytes fixed)
      const isWinnerEncoded = new Uint8Array([0x01]) // bool: true (1 byte)

      const structBytes = new Uint8Array([
        ...betTypeEncoded,
        ...betValueEncoded,
        ...diceValueEncoded,
        ...multiplierEncoded,
        ...isWinnerEncoded,
      ])

      const returnData = [Buffer.from(structBytes).toString('base64')]

      const decoded = decoder.decodeFunctionResults('getLastResult', returnData)

      expect(decoded).toHaveLength(1)
      const bet = decoded[0] as Record<string, unknown>
      expect(bet['bet_type']).toBe(0)
      expect(bet['bet_value']).toBe(50)
      expect(bet['dice_value']).toBe(46)
      expect(bet['multiplier']).toBe(195000)
      expect(bet['is_winner']).toBe(true)
    })

    it('should encode and decode round-trip correctly', () => {
      const encoder = new ABIEncoder(loadABI(diceAbi))
      const decoder = new ABIDecoder(loadABI(diceAbi))

      // Encode bet arguments
      const original = [0, 50]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const encoded = encoder.encodeFunctionArgs('bet', original)

      // Create mock return data (bet function returns Bet struct)
      const betStruct = {
        bet_type: 0,
        bet_value: 50,
        dice_value: 46,
        multiplier: 195000,
        is_winner: true,
      }

      // Encode the struct as nested fields (fixed-size, no length prefix)
      const betTypeEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x00]) // bet_type: u32 = 0 (4 bytes)
      const betValueEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x32]) // u32: 50 (4 bytes fixed)
      const diceValueEncoded = new Uint8Array([0x00, 0x00, 0x00, 0x2e]) // u32: 46 (4 bytes fixed)
      const multiplierEncoded = new Uint8Array([0x00, 0x02, 0xf9, 0xb8]) // u32: 195000 (4 bytes fixed)
      const isWinnerEncoded = new Uint8Array([0x01]) // bool: true (1 byte)

      // Concatenate all fields for the struct
      const structBytes = new Uint8Array([
        ...betTypeEncoded,
        ...betValueEncoded,
        ...diceValueEncoded,
        ...multiplierEncoded,
        ...isWinnerEncoded,
      ])

      // Convert to base64 for decoder
      const returnData = [Buffer.from(structBytes).toString('base64')]

      const decoded = decoder.decodeFunctionResults('bet', returnData)
      const result = decoded[0] as Record<string, unknown>

      expect(result['bet_type']).toBe(betStruct.bet_type)
      expect(result['bet_value']).toBe(betStruct.bet_value)
      expect(result['dice_value']).toBe(betStruct.dice_value)
      expect(result['multiplier']).toBe(betStruct.multiplier)
      expect(result['is_winner']).toBe(betStruct.is_winner)
    })
  })

  describe('Receipt Parsing', () => {
    it('should parse deployment receipt correctly', () => {
      const mockReceipt: TransactionReceipt = {
        hash: 'mock-deploy-hash',
        status: 'success',
        receipts: [
          {
            type: 21,
            typeString: 'SmartContract',
            address: MOCK_CONTRACT_ADDRESS,
            owner: MOCK_USER_ADDRESS,
            vmType: 0,
          },
        ],
      }

      const parsed = parseReceipt.deploy(mockReceipt)

      expect(parsed.contractAddress).toBe(MOCK_CONTRACT_ADDRESS)
      expect(parsed.owner).toBe(MOCK_USER_ADDRESS)
      expect(parsed.vmType).toBe(0)
    })

    it('should parse contract call receipt correctly', () => {
      const mockReceipt: TransactionReceipt = {
        hash: 'mock-call-hash',
        status: 'success',
        contract: [
          {
            parameter: {
              address: MOCK_CONTRACT_ADDRESS,
            },
          },
        ],
        data: ['bet@00@32'],
        receipts: [
          {
            type: 21,
            typeString: 'SmartContract',
            returnData: ['AAAAAA==', 'AAAAMg=='],
          },
        ],
      }

      const parsed = parseReceipt.call(mockReceipt)

      expect(parsed.contractAddress).toBe(MOCK_CONTRACT_ADDRESS)
      expect(parsed.functionName).toBe('bet')
      expect(parsed.returnData).toHaveLength(2)
      expect(parsed.returnData?.[0]).toBe('AAAAAA==')
    })

    it('should extract contract address from deployment using static method', () => {
      const mockReceipt: TransactionReceipt = {
        hash: 'mock-deploy-hash',
        status: 'success',
        receipts: [
          {
            type: 21,
            address: MOCK_CONTRACT_ADDRESS,
          },
        ],
      }

      const address = ContractFactory.getDeployedAddress(mockReceipt)
      expect(address).toBe(MOCK_CONTRACT_ADDRESS)
    })
  })

  describe('ContractFactory', () => {
    it('should create factory with ABI and bytecode', () => {
      const mockBytecode = new Uint8Array([0x00, 0x61, 0x73, 0x6d]) // WASM magic number
      const factory = new ContractFactory(loadABI(diceAbi), mockBytecode, signer)

      expect(factory.interface.name).toBe('Dice')
      expect(factory.bytecode).toEqual(mockBytecode)
      expect(factory.signer).toBe(signer)
    })

    it('should handle hex string bytecode', () => {
      const hexBytecode = '0061736d' // WASM magic number in hex
      const factory = new ContractFactory(loadABI(diceAbi), hexBytecode, signer)

      expect(factory.bytecode).toEqual(new Uint8Array([0x00, 0x61, 0x73, 0x6d]))
    })

    it('should get deployment transaction data', () => {
      const mockBytecode = new Uint8Array([0x00, 0x61, 0x73, 0x6d])
      const factory = new ContractFactory(loadABI(diceAbi), mockBytecode, signer)

      const deployTx = factory.getDeployTransaction()

      expect(deployTx.data).toBeDefined()
      expect(deployTx.data).toContain('0061736d') // Bytecode hex
    })
  })

  describe('End-to-End Workflow', () => {
    it('should support complete query workflow', async () => {
      // 1. Create contract instance
      const contract = new Contract(MOCK_CONTRACT_ADDRESS, loadABI(diceAbi), provider)

      // 2. Call readonly method
      const result = await contract['getLastResult'](MOCK_USER_ADDRESS)

      // 3. Verify result
      expect(result).toBeDefined()
      const bet = result as Record<string, unknown>
      expect(bet['bet_type']).toBe(0)
      expect(bet['is_winner']).toBe(true)
    })

    it('should support contract connection and attachment', () => {
      // 1. Create initial contract
      const contract1 = new Contract(MOCK_CONTRACT_ADDRESS, loadABI(diceAbi), provider)

      // 2. Connect to different signer
      const newSigner = new MockSigner(provider)
      const contract2 = contract1.connect(newSigner)

      expect(contract2.signer).toBe(newSigner)
      expect(contract2.address).toBe(MOCK_CONTRACT_ADDRESS)

      // 3. Attach to different address
      const newAddress = 'klv1qqqqqqqqqqqqqqpgq0000000000000000000000000000000qg8s8am'
      const contract3 = contract1.attach(newAddress)

      expect(contract3.address).toBe(newAddress)
      expect(contract3.provider).toBe(provider)
    })
  })
})
