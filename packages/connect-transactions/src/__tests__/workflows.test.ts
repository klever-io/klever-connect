import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionBuilder } from '../builder'
import { Transaction } from '../transaction'
import type { IProvider } from '@klever/connect-provider'
import { TXType } from '@klever/connect-core'
import { cryptoProvider } from '@klever/connect-crypto'

describe('Transaction Workflows: Real-world scenarios', () => {
  let mockProvider: IProvider

  beforeEach(() => {
    mockProvider = {
      getNetwork: vi.fn().mockReturnValue({
        name: 'testnet',
        chainId: '109',
        nodeUrl: 'https://api.testnet.klever.finance',
      }),
      buildTransaction: vi.fn(),
    } as unknown as IProvider
  })

  describe('Transfer workflows', () => {
    it('should build a simple KLV transfer transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(sender).nonce(100).transfer({
        receiver,
        amount: 5000000n, // 5 KLV
        kda: 'KLV',
      })

      const request = builder.buildRequest()

      expect(request.sender).toBe(sender)
      expect(request.nonce).toBe(100)
      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Transfer)
      expect(request.contracts[0]).toMatchObject({
        receiver,
        amount: 5000000,
        kda: 'KLV',
      })
    })

    it('should build a token transfer transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(sender).nonce(50).transfer({
        receiver,
        amount: 10000000n, // 10 USDT (assuming 6 decimals)
        kda: 'USDT-ABC123',
      })

      const request = builder.buildRequest()

      expect(request.contracts[0]).toMatchObject({
        receiver,
        amount: 10000000,
        kda: 'USDT-ABC123',
      })
    })

    it('should build multi-transfer batch transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder
        .sender(sender)
        .nonce(200)
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
          kda: 'KLV',
        })
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 2000000n,
          kda: 'USDT-ABC123',
        })
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 3000000n,
          kda: 'KLV',
        })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(3)
      expect(request.contracts.every((c) => c.contractType === 0)).toBe(true)
      expect(request.contracts[0]).toMatchObject({ amount: 1000000, kda: 'KLV' })
      expect(request.contracts[1]).toMatchObject({
        amount: 2000000,
        kda: 'USDT-ABC123',
      })
      expect(request.contracts[2]).toMatchObject({ amount: 3000000, kda: 'KLV' })
    })
  })

  describe('Staking workflows', () => {
    it('should build a complete staking workflow (freeze + delegate)', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const validator = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder
        .sender(sender)
        .nonce(50)
        .freeze({ amount: 10000000n, kda: 'KLV' }) // Freeze 10 KLV
        .delegate({ receiver: validator }) // Delegate to validator

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(2)

      // Verify freeze contract
      expect(request.contracts[0].contractType).toBe(TXType.Freeze)
      expect(request.contracts[0]).toMatchObject({
        amount: 10000000,
        kda: 'KLV',
      })

      // Verify delegate contract
      expect(request.contracts[1].contractType).toBe(TXType.Delegate)
      expect(request.contracts[1]).toMatchObject({
        receiver: validator,
      })
    })

    it('should build an unstaking workflow (undelegate + unfreeze)', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder
        .sender(sender)
        .nonce(75)
        .undelegate({ bucketId: 'bucket123' }) // Undelegate from validator
        .unfreeze({ kda: 'KLV', bucketId: 'bucket123' }) // Unfreeze tokens

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(2)
      expect(request.contracts[0].contractType).toBe(TXType.Undelegate)
      expect(request.contracts[0]).toMatchObject({
        bucketId: 'bucket123',
      })
      expect(request.contracts[1].contractType).toBe(TXType.Unfreeze)
      expect(request.contracts[1]).toMatchObject({
        bucketId: 'bucket123',
      })
    })

    it('should build a claim rewards transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(sender).nonce(10).claim({
        claimType: 0,
        id: 'reward123',
      })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Claim)
      expect(request.contracts[0]).toMatchObject({
        claimType: 0,
        id: 'reward123',
      })
    })
  })

  describe('Token creation workflow', () => {
    it('should build a token creation transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const owner = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(owner).nonce(1).createAsset({
        type: 0, // Fungible token
        name: 'My Awesome Token',
        ticker: 'MAT',
        ownerAddress: owner,
        precision: 6,
        maxSupply: 1000000000000n, // 1 million tokens (with 6 decimals)
      })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.CreateAsset)
      expect(request.contracts[0]).toMatchObject({
        type: 0,
        name: 'My Awesome Token',
        ticker: 'MAT',
        ownerAddress: owner,
        precision: 6,
        maxSupply: 1000000000000,
      })
    })
  })

  describe('Validator workflows', () => {
    it('should build a validator creation transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const owner = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(owner).nonce(1).createValidator({
        blsPublicKey: '0xabc123def456...',
        ownerAddress: owner,
        commission: 10, // 10% commission
      })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.CreateValidator)
      expect(request.contracts[0]).toMatchObject({
        blsPublicKey: '0xabc123def456...',
        ownerAddress: owner,
        commission: 10,
      })
    })
  })

  describe('Voting workflow', () => {
    it('should build a governance vote transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const voter = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(voter).nonce(42).vote({
        type: 0,
        proposalId: 5,
        amount: 1000000n, // Vote with 1 KLV
      })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.Vote)
      expect(request.contracts[0]).toMatchObject({
        proposalId: 5,
        amount: 1000000,
      })
    })
  })

  describe('Smart contract interaction', () => {
    it('should build a smart contract call transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const caller = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const contractAddress = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder
        .sender(caller)
        .nonce(99)
        .smartContract({
          scType: 0,
          address: contractAddress,
          callValue: { KLV: 1000000n }, // Send 1 KLV to contract
        })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(1)
      expect(request.contracts[0].contractType).toBe(TXType.SmartContract)
      expect(request.contracts[0]).toMatchObject({
        address: contractAddress,
        callValue: { KLV: 1000000 },
      })
    })
  })

  describe('Transaction preparation flow', () => {
    it('should build, sign, and prepare transaction for broadcast', async () => {
      // Step 1: Build transaction using provider
      const mockResponse = {
        result: {
          RawData: {
            ChainID: new Uint8Array([1, 0, 9]), // Chain ID 109
            Nonce: 123,
            Sender: new Uint8Array([1, 2, 3]),
            Contract: [],
            KAppFee: 500000,
            BandwidthFee: 100000,
          },
        },
        txHash: 'mock-tx-hash-123',
      }

      const mockBuildTransaction = vi.fn().mockResolvedValue(mockResponse)
      mockProvider.buildTransaction = mockBuildTransaction

      const builder = new TransactionBuilder(mockProvider)
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      builder.sender(sender).transfer({
        receiver,
        amount: 5000000n,
        kda: 'KLV',
      })

      const tx = await builder.build()

      // Step 2: Verify transaction was built correctly
      expect(tx).toBeInstanceOf(Transaction)
      expect(mockBuildTransaction).toHaveBeenCalledWith({
        contracts: expect.any(Array),
        sender,
      })

      // Step 3: Sign transaction with private key
      const mockSignature = new Uint8Array([10, 20, 30, 40])
      vi.spyOn(cryptoProvider, 'signMessage').mockResolvedValue({
        bytes: mockSignature,
        hex: '0a141e28',
        toHex: () => '0a141e28',
        toBase64: () => 'ChQeKA==',
      })

      const mockPrivateKey = {
        bytes: new Uint8Array(32),
        hex: '0'.repeat(64),
        toHex: () => '0'.repeat(64),
      }

      await tx.sign(mockPrivateKey)

      // Step 4: Verify transaction is properly signed
      expect(tx.isSigned()).toBe(true)

      // Step 5: Prepare transaction for broadcast
      // Get bytes format (for direct RPC broadcast)
      const txBytes = tx.toBytes()
      expect(txBytes).toBeInstanceOf(Uint8Array)
      expect(txBytes.length).toBeGreaterThan(0)

      // Get hex format (for HTTP API broadcast)
      const txHex = tx.toHex()
      expect(typeof txHex).toBe('string')
      expect(txHex.length).toBeGreaterThan(0)

      // Transaction is now ready to be broadcast via provider.sendRawTransaction()
      // Note: This is a workflow test, not an integration test
      // Real integration tests would broadcast to testnet and verify on-chain
    })
  })

  describe('Complex multi-operation workflows', () => {
    it('should build a complex DeFi workflow transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const user = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      // Scenario: User wants to:
      // 1. Claim staking rewards
      // 2. Transfer some KLV to another wallet
      // 3. Freeze remaining KLV for staking
      builder
        .sender(user)
        .nonce(300)
        .claim({ claimType: 0, id: 'rewards-2024' })
        .transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 2000000n,
          kda: 'KLV',
        })
        .freeze({ amount: 8000000n, kda: 'KLV' })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(3)
      expect(request.contracts[0].contractType).toBe(TXType.Claim)
      expect(request.contracts[1].contractType).toBe(TXType.Transfer)
      expect(request.contracts[2].contractType).toBe(TXType.Freeze)
    })

    it('should build an airdrop distribution transaction', () => {
      const builder = new TransactionBuilder(mockProvider)
      const distributor = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      // Airdrop 100 tokens to 5 different addresses
      const recipients = [
        'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
      ]

      builder.sender(distributor).nonce(1000)

      recipients.forEach((recipient) => {
        builder.transfer({
          receiver: recipient,
          amount: 100000000n, // 100 tokens
          kda: 'AIRDROP-TOKEN',
        })
      })

      const request = builder.buildRequest()

      expect(request.contracts).toHaveLength(5)
      expect(request.contracts.every((c) => c.contractType === 0)).toBe(true)

      // Verify each transfer contract has correct parameters
      request.contracts.forEach((contract) => {
        expect(contract).toMatchObject({
          amount: 100000000,
          kda: 'AIRDROP-TOKEN',
        })
      })
    })
  })

  describe('Transaction builder flexibility', () => {
    it('should support building same transaction with different approaches', () => {
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      // Approach 1: Using builder state
      const builder1 = new TransactionBuilder(mockProvider)
      builder1.sender(sender).nonce(100).transfer({ receiver, amount: 1000000n })

      // Approach 2: Using buildRequest without explicit sender/nonce
      const builder2 = new TransactionBuilder(mockProvider)
      builder2.transfer({ receiver, amount: 1000000n })

      // Both should work, builder1 has more info
      const request1 = builder1.buildRequest()
      const request2 = builder2.buildRequest()

      expect(request1.sender).toBe(sender)
      expect(request1.nonce).toBe(100)
      expect(request2.sender).toBeUndefined()
      expect(request2.nonce).toBeUndefined()

      // But both have the same contract
      expect(request1.contracts[0]).toMatchObject(request2.contracts[0])
    })
  })
})
