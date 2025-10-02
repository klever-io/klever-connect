import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { KleverProvider } from '../provider'
import { NETWORKS } from '../networks'
import type { IAccount } from '../types/api-types'
import type { KleverAddress, TransactionHash } from '@klever/connect-core'

// Mock the HttpClient
vi.mock('../http-client', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
  })),
}))

describe('KleverProvider', () => {
  let provider: KleverProvider

  beforeEach(() => {
    provider = new KleverProvider({
      network: NETWORKS.testnet,
      cache: { ttl: 1000, maxSize: 10 },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create provider with default network', () => {
      const defaultProvider = new KleverProvider()
      expect(defaultProvider).toBeDefined()
      expect(defaultProvider.getNetworkName()).toBe('mainnet')
    })

    it('should create provider with custom network', () => {
      const testProvider = new KleverProvider({ network: NETWORKS.testnet })
      expect(testProvider.getNetworkName()).toBe('testnet')
    })

    it('should create provider with cache disabled', () => {
      const noCacheProvider = new KleverProvider({
        network: NETWORKS.testnet,
        cache: false,
      })
      expect(noCacheProvider).toBeDefined()
    })

    it('should create provider with debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      new KleverProvider({ network: NETWORKS.testnet, debug: true })
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[KleverProvider] Initialized'),
      )
      consoleSpy.mockRestore()
    })
  })

  describe('getAccount', () => {
    const validAddress =
      'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5' as KleverAddress
    const mockAccountResponse = {
      error: null,
      data: {
        account: {
          address: validAddress,
          balance: '1000000',
          nonce: 5,
          assets: {
            KLV: { balance: '1000000' },
            'KDA-123': { balance: '500000' },
          },
        },
      },
    }

    it('should fetch account data', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockAccountResponse)
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const account = await provider.getAccount(validAddress)

      expect(account).toBeDefined()
      expect(account.address).toBe(validAddress)
      expect(account.balance).toBe(1000000n)
      expect(account.nonce).toBe(5)
      expect(account.assets).toHaveLength(2)
      expect(mockGet).toHaveBeenCalledWith(`/v1.0/address/${validAddress}`)
    })

    it('should throw error for invalid address', async () => {
      await expect(provider.getAccount('invalid-address')).rejects.toThrow('Invalid address')
    })

    it('should throw error when account not found', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: null,
        data: { account: null },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await expect(provider.getAccount(validAddress)).rejects.toThrow('Account not found')
    })

    it('should throw error on API error', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: 'API Error',
        data: null,
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await expect(provider.getAccount(validAddress)).rejects.toThrow('API Error')
    })

    it('should cache account data', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockAccountResponse)
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      // First call
      await provider.getAccount(validAddress)
      // Second call should use cache
      await provider.getAccount(validAddress)

      expect(mockGet).toHaveBeenCalledTimes(1)
    })

    it('should skip cache when requested', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockAccountResponse)
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await provider.getAccount(validAddress)
      await provider.getAccount(validAddress, { skipCache: true })

      expect(mockGet).toHaveBeenCalledTimes(2)
    })
  })

  describe('getBalance', () => {
    const validAddress =
      'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5' as KleverAddress
    const mockAccount: IAccount = {
      address: validAddress,
      balance: 1000000n,
      nonce: 5,
      assets: [
        { assetId: 'KLV', balance: 1000000n },
        { assetId: 'KDA-123', balance: 500000n },
      ],
    }

    beforeEach(() => {
      vi.spyOn(provider, 'getAccount').mockResolvedValue(mockAccount)
    })

    it('should get KLV balance', async () => {
      const balance = await provider.getBalance(validAddress)
      expect(balance).toBe(1000000n)
    })

    it('should get KDA balance', async () => {
      const balance = await provider.getBalance(validAddress, 'KDA-123')
      expect(balance).toBe(500000n)
    })

    it('should return 0 for non-existent asset', async () => {
      const balance = await provider.getBalance(validAddress, 'NON-EXISTENT')
      expect(balance).toBe(0n)
    })
  })

  describe('getTransaction', () => {
    const mockTxHash = '0x123abc'
    const mockTxResponse = {
      error: null,
      data: {
        transaction: {
          hash: mockTxHash,
          status: 'success',
          receipts: [],
        },
      },
    }

    it('should fetch transaction data', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockTxResponse)
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const tx = await provider.getTransaction(mockTxHash)

      expect(tx).toBeDefined()
      expect(tx?.hash).toBe(mockTxHash)
      expect(mockGet).toHaveBeenCalledWith(`/v1.0/transaction/${mockTxHash}?withResults=true`)
    })

    it('should cache transaction data', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockTxResponse)
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await provider.getTransaction(mockTxHash)
      await provider.getTransaction(mockTxHash)

      expect(mockGet).toHaveBeenCalledTimes(1)
    })

    it('should throw error when transaction not found', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: 'Transaction not found',
        data: null,
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await expect(provider.getTransaction(mockTxHash)).rejects.toThrow('Transaction not found')
    })
  })

  describe('getTransactionReceipt', () => {
    const mockTxHash = '0x123abc' as TransactionHash
    const mockReceipts = [
      { type: 1, status: 'success' },
      { type: 2, status: 'success' },
    ]

    it('should get transaction receipts', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(provider, 'getTransaction').mockResolvedValue({
        hash: mockTxHash,
        receipts: mockReceipts,
      } as any)

      const receipts = await provider.getTransactionReceipt(mockTxHash)
      expect(receipts).toEqual(mockReceipts)
    })

    it('should return null if transaction not found', async () => {
      vi.spyOn(provider, 'getTransaction').mockResolvedValue(null)

      const receipts = await provider.getTransactionReceipt(mockTxHash)
      expect(receipts).toBeNull()
    })

    it('should return empty array if no receipts', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(provider, 'getTransaction').mockResolvedValue({
        hash: mockTxHash,
      } as any)

      const receipts = await provider.getTransactionReceipt(mockTxHash)
      expect(receipts).toEqual([])
    })
  })

  describe('broadcastTransaction', () => {
    const mockTxData = { tx: '0xaabbcc' }
    const mockResponse = {
      error: null,
      code: 0,
      message: 'success',
      data: {
        txHash: '0x123abc',
      },
    }

    it('should broadcast transaction successfully', async () => {
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const result = await provider.broadcastTransaction(mockTxData)

      expect(result.hash).toBe('0x123abc')
      expect(result.code).toBe(0)
      expect(result.message).toBe('success')
      expect(mockPost).toHaveBeenCalledWith('/transaction/broadcast', mockTxData)
    })

    it('should throw error on broadcast failure', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: 'Broadcast failed',
        data: null,
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await expect(provider.broadcastTransaction(mockTxData)).rejects.toThrow('Broadcast failed')
    })
  })

  describe('queryContract', () => {
    const mockParams = {
      ScAddress: 'klv1contract...',
      FuncName: 'getBalance',
      Args: [],
    }

    it('should query contract successfully', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        data: {
          returnData: ['0x123'],
          returnCode: 'ok',
          returnMessage: '',
          gasRemaining: '1000',
          gasRefund: '100',
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.post = mockPost

      const result = await provider.queryContract(mockParams)

      expect(result.data).toBeDefined()
      expect(result.data?.returnData).toEqual(['0x123'])
      expect(result.data?.returnCode).toBe('ok')
      expect(result.data?.gasRemaining).toBe(1000n)
    })

    it('should handle contract query error', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: 'Contract not found',
        code: 404,
        data: null,
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.post = mockPost

      const result = await provider.queryContract(mockParams)

      expect(result.error).toBe('Contract not found')
      expect(result.code).toBe(404)
    })
  })

  describe('requestTestKLV', () => {
    const validAddress =
      'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5' as KleverAddress

    it('should request test KLV on testnet', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        data: {
          txHash: '0x456def',
          status: 'success',
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.post = mockPost

      const result = await provider.requestTestKLV(validAddress)

      expect(result.txHash).toBe('0x456def')
      expect(result.status).toBe('success')
    })

    it('should request test KLV with custom amount', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        data: {
          txHash: '0x789ghi',
          status: 'success',
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.post = mockPost

      await provider.requestTestKLV(validAddress, 5000000n)

      expect(mockPost).toHaveBeenCalledWith(
        `/v1.0/transaction/send-user-funds/${validAddress}`,
        { amount: '5000000' },
      )
    })

    it('should throw error on mainnet', async () => {
      const mainnetProvider = new KleverProvider({ network: NETWORKS.mainnet })

      await expect(mainnetProvider.requestTestKLV(validAddress)).rejects.toThrow(
        'Faucet is not available on mainnet',
      )
    })

    it('should throw error for invalid address', async () => {
      await expect(provider.requestTestKLV('invalid-address')).rejects.toThrow('Invalid address')
    })
  })

  describe('sendRawTransaction', () => {
    it('should send raw transaction as hex string', async () => {
      const mockHash = '0x123abc' as TransactionHash
      const mockBroadcast = vi.spyOn(provider, 'broadcastTransaction').mockResolvedValue({
        hash: mockHash,
      })

      const txData = '0xaabbcc'
      const hash = await provider.sendRawTransaction(txData)

      expect(hash).toBe(mockHash)
      expect(mockBroadcast).toHaveBeenCalledWith({ tx: txData })
    })

    it('should send raw transaction as Uint8Array', async () => {
      const mockHash = '0x123abc' as TransactionHash
      const mockBroadcast = vi.spyOn(provider, 'broadcastTransaction').mockResolvedValue({
        hash: mockHash,
      })

      const txData = new Uint8Array([0xaa, 0xbb, 0xcc])
      const hash = await provider.sendRawTransaction(txData)

      expect(hash).toBe(mockHash)
      expect(mockBroadcast).toHaveBeenCalledWith({ tx: 'aabbcc' })
    })
  })

  describe('buildTransaction', () => {
    it('should build transaction successfully', async () => {
      const mockRequest = {
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        contracts: [
          {
            type: 0,
            parameter: {
              receiver: 'klv1abc...',
              amount: 1000000n,
            },
          },
        ],
      }

      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        data: {
          sender: mockRequest.sender,
          nonce: 10,
          kAppFee: 1000,
          bandwidthFee: 500,
          data: 'deadbeef',
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const result = await provider.buildTransaction(mockRequest)

      expect(result.sender).toBe(mockRequest.sender)
      expect(result.nonce).toBe(10)
      expect(result.kAppFee).toBe(1000)
      expect(result.bandwidthFee).toBe(500)
      expect(result.data).toBeInstanceOf(Buffer)
      expect(result.contracts).toEqual(mockRequest.contracts)
    })

    it('should throw error when no contracts provided', async () => {
      await expect(
        provider.buildTransaction({
          sender: 'klv1...',
          contracts: [],
        }),
      ).rejects.toThrow('At least one contract is required')
    })

    it('should throw error on build failure', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: 'Build failed',
        data: null,
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await expect(
        provider.buildTransaction({
          sender: 'klv1...',
          contracts: [{ type: 0, parameter: {} }],
        }),
      ).rejects.toThrow('Failed to build transaction: Build failed')
    })
  })

  describe('utility methods', () => {
    it('should clear cache', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugProvider = new KleverProvider({
        network: NETWORKS.testnet,
        debug: true,
      })

      debugProvider.clearCache()
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cache cleared'))
      consoleSpy.mockRestore()
    })

    it('should get transaction URL', () => {
      const txHash = '0x123abc'
      const url = provider.getTransactionUrl(txHash)
      expect(url).toBe(`https://testnet.kleverscan.org/transaction/${txHash}`)
    })

    it('should get network name', () => {
      expect(provider.getNetworkName()).toBe('testnet')
    })

    it('should get network object', () => {
      const network = provider.getNetwork()
      expect(network).toBe(NETWORKS.testnet)
    })

    it('should get block number (TODO)', async () => {
      const blockNumber = await provider.getBlockNumber()
      expect(blockNumber).toBe(0)
    })

    it('should get block (TODO)', async () => {
      const block = await provider.getBlock('latest')
      expect(block).toBeNull()
    })

    it('should estimate fee (TODO)', async () => {
      const fee = await provider.estimateFee({})
      expect(fee).toBeDefined()
      expect(fee.kAppFee).toBe(0)
    })

    it('should wait for transaction (TODO)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await provider.waitForTransaction('0x123' as any)
      expect(tx).toBeNull()
    })
  })

  describe('event listeners (TODO)', () => {
    it('should register event listener', () => {
      const listener = vi.fn()
      expect(() => provider.on('block', listener)).not.toThrow()
    })

    it('should unregister event listener', () => {
      const listener = vi.fn()
      expect(() => provider.off('block', listener)).not.toThrow()
    })
  })

  describe('contract call (TODO)', () => {
    it('should call contract method', async () => {
      const result = await provider.call('/contract/method')
      expect(result).toEqual({})
    })
  })
})
