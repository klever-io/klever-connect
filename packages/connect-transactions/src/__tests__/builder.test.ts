import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionBuilder } from '../builder'
import { Transaction } from '../transaction'
import type { IProvider } from '@klever/connect-provider'
import { TXType } from '@klever/connect-core'

describe('TransactionBuilder', () => {
  let mockProvider: IProvider

  beforeEach(() => {
    mockProvider = {
      getNetwork: vi.fn().mockReturnValue({
        name: 'testnet',
        chainId: '100420',
        nodeUrl: 'https://api.testnet.klever.finance',
      }),
      buildTransaction: vi.fn(),
    } as unknown as IProvider
  })

  describe('constructor', () => {
    it('should create builder without provider', () => {
      const builder = new TransactionBuilder()
      expect(builder).toBeInstanceOf(TransactionBuilder)
      expect(builder.getProvider()).toBeUndefined()
    })

    it('should create builder with provider', () => {
      const builder = new TransactionBuilder(mockProvider)
      expect(builder.getProvider()).toBe(mockProvider)
    })
  })

  describe('setProvider', () => {
    it('should set provider', () => {
      const builder = new TransactionBuilder()
      expect(builder.getProvider()).toBeUndefined()

      builder.setProvider(mockProvider)
      expect(builder.getProvider()).toBe(mockProvider)
    })
  })

  describe('setChainId', () => {
    it('should set chain ID', () => {
      const builder = new TransactionBuilder()
      const result = builder.setChainId('100420')

      expect(result).toBe(builder) // Should be chainable
    })
  })

  describe('sender', () => {
    it('should set valid sender address', () => {
      const builder = new TransactionBuilder()
      const validAddress = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      const result = builder.sender(validAddress)
      expect(result).toBe(builder) // Should be chainable
    })

    it('should throw error for invalid sender address', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.sender('invalid-address')).toThrow('Invalid sender address')
    })
  })

  describe('nonce', () => {
    it('should set valid nonce', () => {
      const builder = new TransactionBuilder()
      const result = builder.nonce(123)

      expect(result).toBe(builder) // Should be chainable
    })

    it('should throw error for negative nonce', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.nonce(-1)).toThrow('Nonce must be non-negative')
    })
  })

  describe('kdaFee', () => {
    it('should set valid KDA fee', () => {
      const builder = new TransactionBuilder()
      const result = builder.kdaFee({ kda: 'USDT', amount: 1000000n })

      expect(result).toBe(builder) // Should be chainable
    })

    it('should throw error for KLV as KDA fee', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.kdaFee({ kda: 'KLV', amount: 1000n })).toThrow(
        'KDA fee cannot be KLV',
      )
    })

    it('should throw error for negative amount', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.kdaFee({ kda: 'USDT', amount: -1000 })).toThrow(
        'KDA fee amount must be non-negative',
      )
    })

    it('should throw error when kda is missing', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.kdaFee({ kda: '', amount: 1000n })).toThrow(
        'KDA fee asset ID is required',
      )
    })
  })

  describe('permissionId', () => {
    it('should set permission ID', () => {
      const builder = new TransactionBuilder()
      const result = builder.permissionId(1)

      expect(result).toBe(builder) // Should be chainable
    })
  })

  describe('data', () => {
    it('should set transaction data', () => {
      const builder = new TransactionBuilder()
      const result = builder.data(['metadata1', 'metadata2'])

      expect(result).toBe(builder) // Should be chainable
    })
  })

  describe('transfer', () => {
    it('should add transfer contract with valid parameters', () => {
      const builder = new TransactionBuilder()
      const result = builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
      })

      expect(result).toBe(builder) // Should be chainable
    })

    it('should accept number and string amounts as raw values', () => {
      const builder = new TransactionBuilder()

      // Test with number
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1500000, // Raw value (1.5 KLV)
      })

      // Test with string (also raw value)
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: "2500000", // Raw value as string (2.5 KLV)
      })

      const request = builder.buildRequest()
      expect(request.contracts[0].amount).toBe(1500000)
      expect(request.contracts[1].amount).toBe(2500000)
    })

    it('should throw error for invalid receiver address', () => {
      const builder = new TransactionBuilder()

      expect(() =>
        builder.transfer({
          receiver: 'invalid-address',
          amount: 1000000n,
        }),
      ).toThrow('Invalid recipient address')
    })

    it('should throw error for zero amount', () => {
      const builder = new TransactionBuilder()

      expect(() =>
        builder.transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 0n,
        }),
      ).toThrow('Transfer amount must be positive')
    })

    it('should include optional parameters', () => {
      const builder = new TransactionBuilder()
      const result = builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
        kda: 'USDT',
      })

      expect(result).toBe(builder)
    })
  })

  describe('freeze', () => {
    it('should add freeze contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.freeze({ amount: 1000000n, kda: 'KLV' })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Freeze)
      expect(request.contracts[0]).toMatchObject({
        amount: 1000000,
        kda: 'KLV',
      })
    })

    it('should throw error for zero amount', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.freeze({ amount: 0n })).toThrow('Freeze amount must be positive')
    })
  })

  describe('unfreeze', () => {
    it('should add unfreeze contract with correct bucket ID', () => {
      const builder = new TransactionBuilder()
      builder.unfreeze({ bucketId: 'bucket123', kda: 'KLV' })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Unfreeze)
      expect(request.contracts[0]).toMatchObject({
        bucketId: 'bucket123',
        kda: 'KLV',
      })
    })

    it('should throw error when KDA is missing', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.unfreeze({ bucketId: 'bucket123' } as any)).toThrow('KDA is required for unfreeze')
    })
  })

  describe('delegate', () => {
    it('should add delegate contract with correct parameters', () => {
      const validatorAddress = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const builder = new TransactionBuilder()
      builder.delegate({
        receiver: validatorAddress,
        bucketId: 'bucket456',
      })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Delegate)
      expect(request.contracts[0]).toMatchObject({
        receiver: validatorAddress,
        bucketId: 'bucket456',
      })
    })

    it('should throw error for invalid validator address', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.delegate({ receiver: 'invalid-address' })).toThrow(
        'Invalid validator address',
      )
    })
  })

  describe('undelegate', () => {
    it('should add undelegate contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.undelegate({ bucketId: 'bucket123' })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Undelegate)
      expect(request.contracts[0]).toMatchObject({
        bucketId: 'bucket123',
      })
    })

    it('should throw error when bucket ID is missing', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.undelegate({ bucketId: '' })).toThrow(
        'Bucket ID is required for undelegate',
      )
    })
  })

  describe('withdraw', () => {
    it('should add withdraw contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.withdraw({ withdrawType: 0, amount: 500000n })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Withdraw)
      expect(request.contracts[0]).toMatchObject({
        withdrawType: 0,
        amount: 500000,
      })
    })
  })

  describe('claim', () => {
    it('should add claim contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.claim({ claimType: 0, id: 'claim123' })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Claim)
      expect(request.contracts[0]).toMatchObject({
        claimType: 0,
        id: 'claim123',
      })
    })
  })

  describe('createAsset', () => {
    it('should add create asset contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.createAsset({
        type: 0,
        name: 'MyToken',
        ticker: 'MTK',
        ownerAddress: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        precision: 6,
        maxSupply: 1000000000n,
      })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.CreateAsset)
      expect(request.contracts[0]).toMatchObject({
        type: 0,
        name: 'MyToken',
        ticker: 'MTK',
        ownerAddress: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        precision: 6,
        maxSupply: 1000000000,
      })
    })
  })

  describe('createValidator', () => {
    it('should add create validator contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.createValidator({
        blsPublicKey: '0xabc123',
        ownerAddress: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        commission: 10,
      })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.CreateValidator)
      expect(request.contracts[0]).toMatchObject({
        blsPublicKey: '0xabc123',
        ownerAddress: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        commission: 10,
      })
    })
  })

  describe('vote', () => {
    it('should add vote contract with correct parameters', () => {
      const builder = new TransactionBuilder()
      builder.vote({
        type: 0,
        proposalId: 1,
        amount: 1000000n,
      })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Vote)
      expect(request.contracts[0]).toMatchObject({
        proposalId: 1,
        amount: 1000000,
      })
    })
  })

  describe('smartContract', () => {
    it('should add smart contract with valid parameters', () => {
      const builder = new TransactionBuilder()
      builder.smartContract({
        scType: 0,
        address: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        callValue: { KLV: 1000000n },
      })

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.SmartContract)
      expect(request.contracts[0]).toMatchObject({
        address: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        callValue: { KLV: 1000000 },
      })
    })

    it('should throw error for invalid contract address', () => {
      const builder = new TransactionBuilder()

      expect(() =>
        builder.smartContract({
          scType: 0,
          address: 'invalid-address',
          callValue: {},
        }),
      ).toThrow('Invalid contract address')
    })
  })

  describe('buildRequest', () => {
    it('should build request with contracts', () => {
      const builder = new TransactionBuilder()
      builder
        .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
        .nonce(123)
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Transfer)
      expect(request.sender).toBe(
        'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      )
      expect(request.nonce).toBe(123)
    })

    it('should throw error when no contracts provided', () => {
      const builder = new TransactionBuilder()

      expect(() => builder.buildRequest()).toThrow('At least one contract is required')
    })

    it('should only include defined optional fields', () => {
      const builder = new TransactionBuilder()
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
      })

      const request = builder.buildRequest()

      expect(request.sender).toBeUndefined()
      expect(request.nonce).toBeUndefined()
    })
  })

  describe('buildProto', () => {
    it('should throw error when no contracts provided', () => {
      const builder = new TransactionBuilder(mockProvider)

      expect(() => builder.buildProto()).toThrow('At least one contract is required')
    })

    it('should throw error when chain ID is missing', () => {
      const builder = new TransactionBuilder()
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
      })

      expect(() => builder.buildProto()).toThrow('Chain ID is required')
    })

    it('should throw error when sender is missing', () => {
      const builder = new TransactionBuilder(mockProvider)
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
      })

      expect(() => builder.buildProto()).toThrow('Sender address is required')
    })

    it('should throw error when nonce is missing', () => {
      const builder = new TransactionBuilder(mockProvider)
      builder
        .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })

      expect(() => builder.buildProto()).toThrow('Nonce is required')
    })

    it('should use builder state when options not provided', () => {
      const builder = new TransactionBuilder(mockProvider)
      builder
        .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
        .nonce(123)
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })

      const tx = builder.buildProto({
        fees: { kAppFee: 500000, bandwidthFee: 100000 },
      })

      expect(tx).toBeInstanceOf(Transaction)
    })

    it('should use options to override builder state', () => {
      const builder = new TransactionBuilder(mockProvider)
      builder
        .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
        .nonce(123)
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })

      const tx = builder.buildProto({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 456, // Override nonce
        fees: { kAppFee: 500000, bandwidthFee: 100000 },
      })

      expect(tx).toBeInstanceOf(Transaction)
    })

    it('should build transaction with all options', () => {
      const builder = new TransactionBuilder(mockProvider)
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
      })

      const tx = builder.buildProto({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 123,
        fees: { kAppFee: 500000, bandwidthFee: 100000 },
        kdaFee: { kda: 'USDT', amount: 1000000n },
        permissionId: 1,
        data: ['metadata'],
      })

      expect(tx).toBeInstanceOf(Transaction)
    })
  })

  describe('build', () => {
    it('should throw error when provider is not set', async () => {
      const builder = new TransactionBuilder()
      builder.transfer({
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000n,
      })

      await expect(builder.build()).rejects.toThrow('Provider required')
    })

    it('should throw error when no contracts provided', async () => {
      const builder = new TransactionBuilder(mockProvider)

      await expect(builder.build()).rejects.toThrow('At least one contract is required')
    })

    it('should call provider buildTransaction', async () => {
      const mockResponse = {
        result: {
          RawData: {
            Sender: new Uint8Array(),
            Nonce: 123,
            KAppFee: 500000,
            BandwidthFee: 100000,
          },
        },
        txHash: 'mock-tx-hash',
      }

      const mockBuildTransaction = vi.fn().mockResolvedValue(mockResponse)
      mockProvider.buildTransaction = mockBuildTransaction

      const builder = new TransactionBuilder(mockProvider)
      builder
        .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })

      const tx = await builder.build()

      expect(tx).toBeInstanceOf(Transaction)
      expect(mockProvider.buildTransaction).toHaveBeenCalledWith({
        contracts: expect.any(Array),
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      })
    })
  })

  describe('reset', () => {
    it('should reset builder state', () => {
      const builder = new TransactionBuilder(mockProvider)
      builder
        .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
        .nonce(123)
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })

      const result = builder.reset()

      expect(result).toBe(builder) // Should be chainable
      expect(() => builder.buildRequest()).toThrow('At least one contract is required')
    })
  })

  describe('fluent API / method chaining', () => {
    it('should allow method chaining and build complex transactions', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      const result = builder
        .sender(sender)
        .nonce(123)
        .kdaFee({ kda: 'USDT', amount: 1000000n })
        .permissionId(1)
        .data(['metadata'])
        .transfer({
          receiver,
          amount: 1000000n,
        })
        .freeze({ amount: 500000n })

      expect(result).toBe(builder)

      const request = builder.buildRequest()
      expect(request.contracts).toHaveLength(2)
      expect(request.contracts[0].contractType).toBe(TXType.Transfer)
      expect(request.contracts[1].contractType).toBe(TXType.Freeze)
      expect(request.sender).toBe(sender)
      expect(request.nonce).toBe(123)
      expect(request.permissionId).toBe(1)
      expect(request.data).toEqual(['metadata'])
      expect(request.kdaFee).toBe('USDT')
    })
  })
})
