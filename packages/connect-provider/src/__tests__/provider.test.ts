import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { KleverProvider } from '../provider'
import { NETWORKS } from '../networks'
import { TransactionStatus, type IAccount, type ITransactionResponse } from '../types/api-types'
import type { BlockHash, KleverAddress, TransactionHash } from '@klever/connect-core'
import type { BuildTransactionRequest } from '../types/types'
import { Transaction as ProtoTransaction } from '@klever/connect-encoding'
import { runInNewContext } from 'node:vm'

// Mock the HttpClient
vi.mock('../http-client', () => ({
  HttpClient: vi.fn().mockImplementation(function () {
    return {
      get: vi.fn(),
      post: vi.fn(),
    }
  }),
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
      ] as unknown as IAccount['assets'],
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
    const validAddress =
      'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5' as KleverAddress
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

    it('should fetch transactions with filters and pagination', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: '',
        code: 'successful',
        data: {
          transactions: [
            {
              hash: '0xaaa',
              blockNum: 10,
              sender: validAddress,
              nonce: 1,
              timestamp: 1,
              kAppFee: 0,
              bandwidthFee: 0,
              totalFee: 0,
              status: TransactionStatus.Success,
              version: 1,
              chainID: '109',
              signature: [],
              receipts: [],
            },
          ],
        },
        pagination: {
          self: 1,
          next: 1,
          previous: 1,
          perPage: 25,
          totalPages: 1,
          totalRecords: 1,
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const result = await provider.getTransactions(validAddress, {
        page: 1,
        limit: 25,
        type: 'Transfer',
        status: 'success',
        asset: 'KLV',
        nonce: 1,
        blockNum: 10,
        role: 'sender',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        orderId: '42',
        marketplaceId: '7',
        orderBy: 'asc',
        withResults: true,
        withInternal: true,
      })

      expect(mockGet).toHaveBeenCalledWith(
        '/v1.0/address/klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5/transactions?page=1&limit=25&type=Transfer&status=success&asset=KLV&nonce=1&blockNum=10&role=sender&startdate=2026-01-01&enddate=2026-01-31&orderid=42&marketplaceid=7&orderBy=asc&withResults=true&withInternal=true',
      )
      expect(result.transactions).toHaveLength(1)
      expect(result.pagination).toEqual({ page: 1, limit: 25, total: 1 })
    })

    it('should throw error for invalid transactions role', async () => {
      await expect(
        provider.getTransactions(validAddress, {
          role: 'invalid' as 'sender' | 'receiver',
        }),
      ).rejects.toThrow('Invalid role')
    })

    it('should throw error for invalid transactions orderBy', async () => {
      await expect(
        provider.getTransactions(validAddress, {
          orderBy: 'invalid' as 'asc' | 'desc',
        }),
      ).rejects.toThrow('Invalid orderBy')
    })

    it('should throw error for invalid transactions page and limit', async () => {
      await expect(
        provider.getTransactions(validAddress, {
          page: 0,
        }),
      ).rejects.toThrow('Invalid page')

      await expect(
        provider.getTransactions(validAddress, {
          limit: 1.5,
        }),
      ).rejects.toThrow('Invalid limit')
    })

    it('should throw error for invalid transactions nonce and blockNum', async () => {
      await expect(
        provider.getTransactions(validAddress, {
          nonce: -1,
        }),
      ).rejects.toThrow('Invalid nonce')

      await expect(
        provider.getTransactions(validAddress, {
          blockNum: 1.5,
        }),
      ).rejects.toThrow('Invalid blockNum')
    })

    it('should allow zero nonce and blockNum filters', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: '',
        code: 'successful',
        data: {
          transactions: [],
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await provider.getTransactions(validAddress, {
        nonce: 0,
        blockNum: 0,
      })

      expect(mockGet).toHaveBeenCalledWith(
        '/v1.0/address/klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5/transactions?nonce=0&blockNum=0',
      )
    })

    it('should return empty transactions with pagination metadata', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: '',
        code: 'successful',
        data: {
          transactions: [],
        },
        pagination: {
          self: 2,
          next: 2,
          previous: 1,
          perPage: 10,
          totalPages: 1,
          totalRecords: 0,
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const result = await provider.getTransactions(validAddress, {
        page: 2,
        limit: 10,
      })

      expect(result.transactions).toEqual([])
      expect(result.pagination).toEqual({ page: 2, limit: 10, total: 0 })
    })

    it('should handle transaction responses without pagination metadata', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: '',
        code: 'successful',
        data: {
          transactions: [
            {
              hash: '0xbbb',
              blockNum: 12,
              sender: validAddress,
              nonce: 2,
              timestamp: 2,
              kAppFee: 0,
              bandwidthFee: 0,
              totalFee: 0,
              status: TransactionStatus.Success,
              version: 1,
              chainID: '109',
              signature: [],
              receipts: [],
            },
          ],
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const result = await provider.getTransactions(validAddress)

      expect(result.transactions).toHaveLength(1)
      expect(result.pagination).toBeUndefined()
    })

    it('should cache transactions by request key', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        error: '',
        code: 'successful',
        data: {
          transactions: [],
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await provider.getTransactions(validAddress, { page: 1 })
      await provider.getTransactions(validAddress, { page: 1 })

      expect(mockGet).toHaveBeenCalledTimes(1)
    })

    it('should skip cached transactions when requested', async () => {
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({
          error: '',
          code: 'successful',
          data: {
            transactions: [],
          },
        })
        .mockResolvedValueOnce({
          error: '',
          code: 'successful',
          data: {
            transactions: [
              {
                hash: '0xccc',
                blockNum: 13,
                sender: validAddress,
                nonce: 3,
                timestamp: 3,
                kAppFee: 0,
                bandwidthFee: 0,
                totalFee: 0,
                status: TransactionStatus.Success,
                version: 1,
                chainID: '109',
                signature: [],
                receipts: [],
              },
            ],
          },
        })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await provider.getTransactions(validAddress, { page: 1 })
      const result = await provider.getTransactions(validAddress, { page: 1, skipCache: true })

      expect(result.transactions).toHaveLength(1)
      expect(mockGet).toHaveBeenCalledTimes(2)
    })

    it('should wrap thrown transaction request errors as NetworkError', async () => {
      const timeoutError = new Error('Request timed out')
      const mockGet = vi.fn().mockRejectedValue(timeoutError)
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await expect(provider.getTransactions(validAddress)).rejects.toMatchObject({
        name: 'NetworkError',
        message: 'Failed to fetch transactions: Request timed out',
        details: {
          address: validAddress,
          endpoint: `/v1.0/address/${validAddress}/transactions`,
          originalError: timeoutError,
        },
      })
    })

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

    it('should skip cached transaction data when requested', async () => {
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce(mockTxResponse)
        .mockResolvedValueOnce({
          error: null,
          data: {
            transaction: {
              hash: mockTxHash,
              status: 'failed',
              receipts: [],
            },
          },
        })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      await provider.getTransaction(mockTxHash)
      const tx = await provider.getTransaction(mockTxHash, { skipCache: true })

      expect(tx?.status).toBe('failed')
      expect(mockGet).toHaveBeenCalledTimes(2)
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
    const mockTxData = { RawData: { Nonce: 1 } }
    const mockResponse = {
      error: null,
      code: 0,
      message: 'success',
      data: {
        txHash: '0x123abc',
        txsHashes: ['0x123abc'],
        count: 1,
      },
    }

    it('should broadcast single transaction successfully', async () => {
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const result = await provider.broadcastTransaction(mockTxData)

      expect(result.hash).toBe('0x123abc')
      expect(result.code).toBe(0)
      expect(result.message).toBe('success')
      expect(mockPost).toHaveBeenCalledWith('/transaction/broadcast', { txs: [mockTxData] })
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

    it('should handle fallback to txHash when txsHashes is empty', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        code: 0,
        data: {
          txHash: '0x456def',
          txsHashes: [],
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const result = await provider.broadcastTransaction(mockTxData)
      expect(result.hash).toBe('0x456def')
    })

    it('should throw error when no hash is returned', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        code: 0,
        data: {
          txsHashes: [],
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await expect(provider.broadcastTransaction(mockTxData)).rejects.toThrow(
        'no transaction hash was returned',
      )
    })
  })

  describe('broadcastTransactions', () => {
    const mockTxs = [
      { RawData: { Nonce: 1 } },
      { RawData: { Nonce: 2 } },
      { RawData: { Nonce: 3 } },
    ]
    const mockResponse = {
      error: null,
      code: 0,
      message: 'success',
      data: {
        txsHashes: ['0x123abc', '0x456def', '0x789ghi'],
        count: 3,
      },
    }

    it('should broadcast multiple transactions successfully', async () => {
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const result = await provider.broadcastTransactions(mockTxs)

      expect(result.hashes).toEqual(['0x123abc', '0x456def', '0x789ghi'])
      expect(result.code).toBe(0)
      expect(result.message).toBe('success')
      expect(mockPost).toHaveBeenCalledWith('/transaction/broadcast', { txs: mockTxs })
    })

    it('should throw error when no transactions provided', async () => {
      await expect(provider.broadcastTransactions([])).rejects.toThrow(
        'At least one transaction is required',
      )
    })

    it('should throw error on broadcast failure', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: 'Broadcast failed',
        data: null,
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await expect(provider.broadcastTransactions(mockTxs)).rejects.toThrow('Broadcast failed')
    })

    it('should throw error when no hashes are returned', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        code: 0,
        data: {
          txsHashes: [],
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await expect(provider.broadcastTransactions(mockTxs)).rejects.toThrow(
        'no transaction hashes were returned',
      )
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

      expect(mockPost).toHaveBeenCalledWith(`/v1.0/transaction/send-user-funds/${validAddress}`, {
        amount: '5000000',
      })
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
    // A real signed transaction with every converted field set: int64 fields,
    // a nested KDAFee.Amount, contracts and a signature. The transfer leaves its
    // Type 0 out, as the node and every signer encode it: an explicit zero
    // isn't what the node hashes, so the hex and bytes paths refuse it.
    const fixture = ProtoTransaction.fromObject({
      RawData: {
        Nonce: 42,
        Sender: new Uint8Array(32).fill(1),
        Contract: [
          {
            Parameter: {
              type_url: 'type.googleapis.com/proto.TransferContract',
              value: new Uint8Array([10, 3, 75, 76, 86]),
            },
          },
          {
            Type: 63,
            Parameter: {
              type_url: 'type.googleapis.com/proto.SmartContract',
              value: new Uint8Array([9, 8, 7]),
            },
          },
        ],
        PermissionID: 2,
        Data: [new Uint8Array([1, 2])],
        KAppFee: 500000,
        BandwidthFee: 100000,
        ChainID: new Uint8Array([49, 48, 57]),
        KDAFee: { KDA: new Uint8Array([75, 70, 73]), Amount: 1234567 },
      },
      Signature: [new Uint8Array(64).fill(7)],
    })
    const fixtureBytes = ProtoTransaction.encode(fixture).finish()
    const fixtureHex = Array.from(fixtureBytes, (b) => b.toString(16).padStart(2, '0')).join('')
    // What the node expects: bytes as base64, int64s and contract types as numbers.
    const expectedBody = {
      RawData: {
        Nonce: 42,
        Sender: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=',
        Contract: [
          {
            Parameter: {
              type_url: 'type.googleapis.com/proto.TransferContract',
              value: 'CgNLTFY=',
            },
          },
          {
            Type: 63,
            Parameter: { type_url: 'type.googleapis.com/proto.SmartContract', value: 'CQgH' },
          },
        ],
        PermissionID: 2,
        Data: ['AQI='],
        KAppFee: 500000,
        BandwidthFee: 100000,
        ChainID: 'MTA5',
        KDAFee: { KDA: 'S0ZJ', Amount: 1234567 },
      },
      Signature: [
        'BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBw==',
      ],
    }

    let mockPost: ReturnType<typeof vi.fn>
    beforeEach(() => {
      mockPost = vi.fn().mockResolvedValue({ data: { txsHashes: ['hash'] } })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost
    })

    /** The transactions as the HTTP client will serialize them. */
    const sentTxs = (): unknown[] =>
      JSON.parse(JSON.stringify(mockPost.mock.calls[0]?.[1])).txs as unknown[]

    it.each([
      ['a hex string', () => fixtureHex],
      ['a 0x hex string', () => '0x' + fixtureHex],
      ['a 0X hex string', () => '0X' + fixtureHex],
      ['bytes', () => fixtureBytes],
      ['a proto-shaped object', () => ProtoTransaction.toObject(fixture)],
      // protobuf.js JSON: int64s as strings and contract types as enum names
      ['a proto Transaction instance', () => fixture],
      ['a JSON string of a proto instance', () => JSON.stringify(fixture)],
      ['a JSON object', () => JSON.parse(JSON.stringify(expectedBody))],
      ['a JSON string', () => JSON.stringify(expectedBody)],
    ])('should send %s to the node as the transaction JSON', async (_, input) => {
      const hash = await provider.sendRawTransaction(input())

      expect(hash).toBe('hash')
      expect(mockPost).toHaveBeenCalledWith('/transaction/broadcast', expect.anything())
      // Regression: bytes used to reach the node as {"0":10,"1":32,...}
      expect(sentTxs()).toEqual([expectedBody])
    })

    it.each([
      ['broadcastTransaction', (p: KleverProvider, tx: unknown) => p.broadcastTransaction(tx)],
      ['sendTransaction', (p: KleverProvider, tx: unknown) => p.sendTransaction(tx)],
      ['broadcastTransactions', (p: KleverProvider, tx: unknown) => p.broadcastTransactions([tx])],
    ])('should normalize hex and bytes passed to %s directly', async (_, send) => {
      await send(provider, fixtureHex)
      await send(provider, fixtureBytes)

      for (const call of mockPost.mock.calls) {
        const body = JSON.parse(JSON.stringify(call[1])) as { txs: unknown[] }
        expect(body.txs).toEqual([expectedBody])
      }
      expect(mockPost).toHaveBeenCalledTimes(2)
    })

    it('should not mutate a JSON object the caller passed in', async () => {
      const input = { RawData: { Nonce: '42' } }
      await provider.sendRawTransaction(input)
      expect(input.RawData.Nonce).toBe('42')
      expect(sentTxs()).toEqual([{ RawData: { Nonce: 42 } }])
    })

    it('should decode bytes from another realm', async () => {
      // instanceof Uint8Array is false for these (iframe, vm, jsdom)
      const foreign = runInNewContext('new Uint8Array(src)', { src: Array.from(fixtureBytes) })
      expect(foreign instanceof Uint8Array).toBe(false)

      await provider.sendRawTransaction(foreign)
      expect(sentTxs()).toEqual([expectedBody])
    })

    it('should convert a proto-shaped object holding bytes from another realm', async () => {
      const foreign = runInNewContext('new Uint8Array(32).fill(1)')
      // Every other byte field is base64, so the foreign Sender is the only bytes value.
      const json = JSON.parse(JSON.stringify(expectedBody)) as { RawData: { [k: string]: unknown } }
      const tx = { ...json, RawData: { ...json.RawData, Sender: foreign } }

      await provider.sendRawTransaction(tx)
      expect(sentTxs()).toEqual([expectedBody])
    })

    it('should send a Buffer as bytes', async () => {
      await provider.sendRawTransaction(Buffer.from(fixtureBytes))
      expect(sentTxs()).toEqual([expectedBody])
    })

    it.each([
      ['a number', 5],
      ['null', null],
      ['undefined', undefined],
      ['a boolean', true],
      ['an object without RawData', { tx: 'data' }],
      ['a JSON string without RawData', JSON.stringify({ tx: 'data' })],
      ['a JSON array string', '[1,2]'],
      ['a number array', [10, 32, 1]],
      ['an ArrayBuffer', new ArrayBuffer(4)],
      ['an object whose RawData is not an object', { RawData: 'x' }],
      ['an object whose toJSON() has no RawData', { toJSON: () => ({ tx: 'data' }) }],
    ])('should reject %s before posting', async (_, input) => {
      await expect(provider.sendRawTransaction(input)).rejects.toThrow(/Invalid transaction data/)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should reject a malformed int64 field before posting', async () => {
      await expect(provider.sendRawTransaction({ RawData: { Nonce: '0x10' } })).rejects.toThrow(
        'Invalid transaction data: Invalid Nonce value',
      )
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should leave every nested part of the caller object unchanged', async () => {
      const input = {
        RawData: {
          Nonce: '42',
          KDAFee: { KDA: 'S0ZJ', Amount: '7' },
          Contract: [{ Type: 'TransferContractType', Parameter: { type_url: 't', value: 'AQ==' } }],
        },
        // A value structuredClone cannot copy: it must not break or leak into errors.
        onDone: () => undefined,
      }
      const before = JSON.stringify(input)

      await provider.sendRawTransaction(input)

      expect(JSON.stringify(input)).toBe(before)
      expect(sentTxs()).toEqual([
        {
          RawData: {
            Nonce: 42,
            KDAFee: { KDA: 'S0ZJ', Amount: 7 },
            Contract: [{ Type: 0, Parameter: { type_url: 't', value: 'AQ==' } }],
          },
        },
      ])
    })

    it('should not put the message thrown by toJSON() into the error', async () => {
      const tx = {
        toJSON: () => {
          throw new Error('leaked-detail')
        },
      }
      const error = await provider.sendRawTransaction(tx).catch((e: unknown) => e)
      expect(String(error)).toContain('toJSON() failed')
      expect(JSON.stringify(error) + String(error)).not.toContain('leaked-detail')
    })

    it('should not copy rejected input into the error', async () => {
      const error = await provider.sendRawTransaction('not-hex').catch((e: unknown) => e)
      expect(JSON.stringify(error)).not.toContain('not-hex')
    })

    it('should send an object with toJSON() as its toJSON() output', async () => {
      const tx = { toJSON: () => expectedBody }
      await provider.sendRawTransaction(tx)
      expect(sentTxs()).toEqual([expectedBody])
    })

    it('should throw error for invalid hex string', async () => {
      const invalidHex = '0xZZZZ' // Invalid hex characters

      await expect(provider.sendRawTransaction(invalidHex)).rejects.toThrow(
        'not valid JSON or hex string',
      )
      expect(mockPost).not.toHaveBeenCalled()
    })

    it.each(['0xabc', 'abc12', '123', '1e5'])(
      'should reject odd-length hex %s instead of broadcasting a truncated byte',
      async (oddHex) => {
        // '0xabc' used to decode as [0xab, 0x0c]: the last single digit became a byte.
        await expect(provider.sendRawTransaction(oddHex)).rejects.toThrow(
          'Invalid transaction data: hex string must have even length',
        )
        expect(mockPost).not.toHaveBeenCalled()
      },
    )

    it.each([
      ['hex that is not a transaction', 'ffffffff'],
      ['bytes that are not a transaction', new Uint8Array([0xff, 0xff, 0xff, 0xff])],
      // Valid protobuf, but no RawData: an empty Signature-only message.
      ['a transaction without RawData', new Uint8Array([0x12, 0x00])],
    ])('should reject %s', async (_, input) => {
      await expect(provider.sendRawTransaction(input)).rejects.toThrow(/Invalid transaction data/)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should reject a transaction whose RawData has a field this SDK does not know', async () => {
      // Signed by a tool with a newer proto: decoding would drop field 99, and
      // the node would hash different bytes than were signed
      const raw = ProtoTransaction.Raw.encode(
        ProtoTransaction.Raw.fromObject({ Nonce: 7, Sender: new Uint8Array([1, 2, 3]) }),
      ).finish()
      const rawWithUnknown = new Uint8Array([...raw, 0x98, 0x06, 0x01])
      const bytes = new Uint8Array([0x0a, rawWithUnknown.length, ...rawWithUnknown])
      const hex = Buffer.from(bytes).toString('hex')

      for (const input of [bytes, hex, `0x${hex}`]) {
        await expect(provider.sendRawTransaction(input)).rejects.toThrow(
          "Invalid transaction data: Encoded transaction's RawData would not reach the node as it was signed",
        )
      }
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should throw error for empty hex string', async () => {
      const emptyHex = '0x'

      await expect(provider.sendRawTransaction(emptyHex)).rejects.toThrow('empty hex string')
    })

    it('should throw error for empty Uint8Array', async () => {
      const emptyArray = new Uint8Array([])

      await expect(provider.sendRawTransaction(emptyArray)).rejects.toThrow('empty Uint8Array')
    })

    it('should throw error when broadcast returns error code', async () => {
      const mockBroadcast = vi.spyOn(provider, 'broadcastTransaction').mockResolvedValue({
        hash: '0x123abc',
        code: 'ERR_INVALID_NONCE',
        message: 'Invalid nonce',
      })

      const txData = '0xaabbcc'

      await expect(provider.sendRawTransaction(txData)).rejects.toThrow('Invalid nonce')
      expect(mockBroadcast).toHaveBeenCalled()
    })

    it('should not throw error for success code "0"', async () => {
      const mockHash = '0x123abc' as TransactionHash
      const mockBroadcast = vi.spyOn(provider, 'broadcastTransaction').mockResolvedValue({
        hash: mockHash,
        code: '0',
        message: 'Success',
      })

      const txData = '0xaabbcc'
      const hash = await provider.sendRawTransaction(txData)

      expect(hash).toBe(mockHash)
      expect(mockBroadcast).toHaveBeenCalled()
    })

    it('should not throw error for success code "successful"', async () => {
      const mockHash = '0x123abc' as TransactionHash
      const mockBroadcast = vi.spyOn(provider, 'broadcastTransaction').mockResolvedValue({
        hash: mockHash,
        code: 'successful',
        message: 'Transaction successful',
      })

      const txData = '0xaabbcc'
      const hash = await provider.sendRawTransaction(txData)

      expect(hash).toBe(mockHash)
      expect(mockBroadcast).toHaveBeenCalled()
    })
  })

  describe('sendRawTransactions', () => {
    it('should send every transaction to the node as JSON, whatever its format', async () => {
      const tx = ProtoTransaction.fromObject({
        RawData: { Nonce: 7, Sender: new Uint8Array(32).fill(2), KAppFee: 1000 },
        Signature: [new Uint8Array(64).fill(3)],
      })
      const bytes = ProtoTransaction.encode(tx).finish()
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
      const mockPost = vi.fn().mockResolvedValue({ data: { txsHashes: ['h1', 'h2', 'h3'] } })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const hashes = await provider.sendRawTransactions([hex, bytes, ProtoTransaction.toObject(tx)])

      expect(hashes).toEqual(['h1', 'h2', 'h3'])
      const sent = JSON.parse(JSON.stringify(mockPost.mock.calls[0]?.[1])).txs as unknown[]
      const expected = {
        RawData: {
          Nonce: 7,
          Sender: 'AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=',
          KAppFee: 1000,
        },
        Signature: [Buffer.from(new Uint8Array(64).fill(3)).toString('base64')],
      }
      expect(sent).toEqual([expected, expected, expected])
    })

    it('should reject the batch when any transaction is malformed', async () => {
      const mockPost = vi.fn()
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await expect(provider.sendRawTransactions(['0xabc'])).rejects.toThrow('even length')
      expect(mockPost).not.toHaveBeenCalled()
    })
  })

  describe('buildTransaction', () => {
    it('should build transaction successfully', async () => {
      const mockRequest = {
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 10,
        contracts: [
          {
            type: 0,
            parameter: {
              receiver: 'klv1abc...',
              amount: 1000000n,
            },
          },
        ],
      } as unknown as BuildTransactionRequest

      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        data: {
          result: {
            RawData: {
              Sender: new Uint8Array(),
              Nonce: 10,
              KAppFee: 1000,
              BandwidthFee: 500,
            },
          },
          txHash: 'mock-tx-hash-123',
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      const result = await provider.buildTransaction(mockRequest)

      expect(result.result).toBeDefined()
      expect(result.txHash).toBe('mock-tx-hash-123')
      expect(mockPost).toHaveBeenCalledWith('/transaction/send', mockRequest)
    })

    it("should send the permission ID as the node's permID", async () => {
      const mockPost = vi.fn().mockResolvedValue({
        error: null,
        data: { result: { RawData: {} }, txHash: 'hash' },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.post = mockPost

      await provider.buildTransaction({
        sender: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        nonce: 1,
        permissionId: 2,
        contracts: [{ contractType: 0, receiver: 'klv1abc', amount: 1 }],
      } as unknown as BuildTransactionRequest)

      const body = mockPost.mock.calls[0]?.[1] as Record<string, unknown>
      expect(body['permID']).toBe(2)
      expect(body).not.toHaveProperty('permissionId')
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
          nonce: 10,
          contracts: [
            { type: 0, parameter: {} },
          ] as unknown as BuildTransactionRequest['contracts'],
        }),
      ).rejects.toThrow('Build failed')
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

    it('should get block number', async () => {
      const mockNonce = 12345
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          overview: {
            nonce: mockNonce,
          },
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.get = mockGet

      const blockNumber = await provider.getBlockNumber()

      expect(mockGet).toHaveBeenCalledWith('/node/overview')
      expect(blockNumber).toBe(mockNonce)
    })

    it('should get block by nonce', async () => {
      const mockBlock = {
        hash: '0817c26971c7b66f0e8d9684ea5656fb0966337ec41c18a91ddc51fde93bef49',
        nonce: 5120071,
        parentHash: '1e411e7669163f24260e7629f6ac9112024729cd7971497a5c3037ab51498bc1',
        timestamp: 1759430636,
        slot: 5135459,
        epoch: 34236,
        isEpochStart: false,
        prevEpochStartSlot: 0,
        size: 380,
        sizeTxs: 0,
        virtualBlockSize: 380,
        txRootHash: '',
        trieRoot: '87c4c3ff6bb3b2a0d6e0f814823bdde61edf23b68a08937a2c5826fe45e82deb',
        validatorsTrieRoot: 'ce2fa348c37af41cc9b4bb96fa4f0e4708a013174f8322ca113ad88a1523df9d',
        kappsTrieRoot: '66ffc3c177137f0a37de3011f5fdfd86e2edb6887a33274c83fc93df0c5d962b',
        producerSignature: 'b1084af84373d0022eb9d1080bd27ba3c6ca6036321342c073b1800c2bbbb5aa',
        signature: 'cc5ea254f001c21fd294ddae0bcd9b1e8bdd65b3d6ed84ba29281b1c8dd297cc',
        prevRandSeed: 'b25d699746e8a391b2dcfbfef51fed05d7e132a51b568e887a4fd10289970aa2',
        randSeed: '1ab968ad5be2429268997c1cb1ebf119cec7e2220e2eb46eb20b8a4be263a532',
        txCount: 0,
        blockRewards: 15000000,
        stakingRewards: 15000000,
        txHashes: [],
        validators: [],
        softwareVersion: 'default',
        chainID: '109',
        reserved: '',
        producerBLS: 'test',
        transactions: null,
        producerName: 'TestProducer',
        producerOwnerAddress: 'klv1test',
        producerLogo: '',
      }
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          block: mockBlock,
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const block = await provider.getBlock(5120071)

      expect(mockGet).toHaveBeenCalledWith('/block/by-nonce/5120071')
      expect(block).toEqual(mockBlock)
    })

    it('should get block by hash', async () => {
      const mockBlock = {
        hash: '0817c26971c7b66f0e8d9684ea5656fb0966337ec41c18a91ddc51fde93bef49',
        nonce: 5120071,
        parentHash: '1e411e7669163f24260e7629f6ac9112024729cd7971497a5c3037ab51498bc1',
        timestamp: 1759430636,
        slot: 5135459,
        epoch: 34236,
        isEpochStart: false,
        prevEpochStartSlot: 0,
        size: 380,
        sizeTxs: 0,
        virtualBlockSize: 380,
        txRootHash: '',
        trieRoot: '87c4c3ff6bb3b2a0d6e0f814823bdde61edf23b68a08937a2c5826fe45e82deb',
        validatorsTrieRoot: 'ce2fa348c37af41cc9b4bb96fa4f0e4708a013174f8322ca113ad88a1523df9d',
        kappsTrieRoot: '66ffc3c177137f0a37de3011f5fdfd86e2edb6887a33274c83fc93df0c5d962b',
        producerSignature: 'b1084af84373d0022eb9d1080bd27ba3c6ca6036321342c073b1800c2bbbb5aa',
        signature: 'cc5ea254f001c21fd294ddae0bcd9b1e8bdd65b3d6ed84ba29281b1c8dd297cc',
        prevRandSeed: 'b25d699746e8a391b2dcfbfef51fed05d7e132a51b568e887a4fd10289970aa2',
        randSeed: '1ab968ad5be2429268997c1cb1ebf119cec7e2220e2eb46eb20b8a4be263a532',
        txCount: 0,
        blockRewards: 15000000,
        stakingRewards: 15000000,
        txHashes: [],
        validators: [],
        softwareVersion: 'default',
        chainID: '109',
        reserved: '',
        producerBLS: 'test',
        transactions: null,
        producerName: 'TestProducer',
        producerOwnerAddress: 'klv1test',
        producerLogo: '',
      }
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          block: mockBlock,
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const block = await provider.getBlock(
        '0817c26971c7b66f0e8d9684ea5656fb0966337ec41c18a91ddc51fde93bef49' as BlockHash,
      )

      expect(mockGet).toHaveBeenCalledWith(
        '/block/by-hash/0817c26971c7b66f0e8d9684ea5656fb0966337ec41c18a91ddc51fde93bef49',
      )
      expect(block).toEqual(mockBlock)
    })

    it('should get latest block', async () => {
      const mockNonce = 5120071
      const mockBlock = {
        hash: '0817c26971c7b66f0e8d9684ea5656fb0966337ec41c18a91ddc51fde93bef49',
        nonce: mockNonce,
        parentHash: '1e411e7669163f24260e7629f6ac9112024729cd7971497a5c3037ab51498bc1',
        timestamp: 1759430636,
        slot: 5135459,
        epoch: 34236,
        isEpochStart: false,
        prevEpochStartSlot: 0,
        size: 380,
        sizeTxs: 0,
        virtualBlockSize: 380,
        txRootHash: '',
        trieRoot: '87c4c3ff6bb3b2a0d6e0f814823bdde61edf23b68a08937a2c5826fe45e82deb',
        validatorsTrieRoot: 'ce2fa348c37af41cc9b4bb96fa4f0e4708a013174f8322ca113ad88a1523df9d',
        kappsTrieRoot: '66ffc3c177137f0a37de3011f5fdfd86e2edb6887a33274c83fc93df0c5d962b',
        producerSignature: 'b1084af84373d0022eb9d1080bd27ba3c6ca6036321342c073b1800c2bbbb5aa',
        signature: 'cc5ea254f001c21fd294ddae0bcd9b1e8bdd65b3d6ed84ba29281b1c8dd297cc',
        prevRandSeed: 'b25d699746e8a391b2dcfbfef51fed05d7e132a51b568e887a4fd10289970aa2',
        randSeed: '1ab968ad5be2429268997c1cb1ebf119cec7e2220e2eb46eb20b8a4be263a532',
        txCount: 0,
        blockRewards: 15000000,
        stakingRewards: 15000000,
        txHashes: [],
        validators: [],
        softwareVersion: 'default',
        chainID: '109',
        reserved: '',
        producerBLS: 'test',
        transactions: null,
        producerName: 'TestProducer',
        producerOwnerAddress: 'klv1test',
        producerLogo: '',
      }
      const mockNodeGet = vi.fn().mockResolvedValue({
        data: {
          overview: {
            nonce: mockNonce,
          },
        },
      })
      const mockApiGet = vi.fn().mockResolvedValue({
        data: {
          block: mockBlock,
        },
      })
      // @ts-expect-error - accessing private property for testing
      provider.nodeClient.get = mockNodeGet
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockApiGet

      const block = await provider.getBlock('latest')

      expect(mockNodeGet).toHaveBeenCalledWith('/node/overview')
      expect(mockApiGet).toHaveBeenCalledWith(`/block/by-nonce/${mockNonce}`)
      expect(block).toEqual(mockBlock)
    })

    it('should return null when block not found', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: {},
        error: 'Block not found',
      })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const block = await provider.getBlock(999999999)

      expect(block).toBeNull()
    })

    it('should estimate fee (TODO)', async () => {
      const fee = await provider.estimateFee({})
      expect(fee).toBeDefined()
      expect(fee.kAppFee).toBe(0)
    })

    it('should wait for transaction and timeout', async () => {
      // Use fake timers for faster test execution
      vi.useFakeTimers()

      // Mock getTransaction to return null (transaction not found)
      vi.spyOn(provider, 'getTransaction').mockResolvedValue(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const promise = provider.waitForTransaction('0x123' as any)

      // Fast-forward through all the polling intervals (40 attempts * 3000ms)
      await vi.runAllTimersAsync()

      const tx = await promise
      expect(tx).toBeNull()

      vi.useRealTimers()
    })

    it('should keep polling when transaction lookup returns HTTP 404', async () => {
      vi.useFakeTimers()

      const confirmedTx: ITransactionResponse = {
        hash: '0x123',
        blockNum: 10,
        sender: 'klv1sender',
        nonce: 1,
        timestamp: 1234567890,
        kAppFee: 0,
        bandwidthFee: 0,
        totalFee: 0,
        status: TransactionStatus.Success,
        version: 1,
        chainID: '1001',
        signature: [],
        receipts: [],
      }
      const onProgress = vi.fn()

      vi.spyOn(provider, 'getTransaction')
        .mockRejectedValueOnce(new Error('HTTP 404: Not Found'))
        .mockRejectedValueOnce(new Error('HTTP 404: Not Found'))
        .mockResolvedValueOnce(confirmedTx)

      const promise = provider.waitForTransaction('0x123' as TransactionHash, undefined, onProgress)

      await vi.advanceTimersByTimeAsync(6000)

      const tx = await promise
      expect(tx).toBe(confirmedTx)
      expect(provider.getTransaction).toHaveBeenCalledTimes(3)
      expect(onProgress).toHaveBeenCalledWith('pending', { attempts: 1, maxAttempts: 40 })
      expect(onProgress).toHaveBeenCalledWith('pending', { attempts: 2, maxAttempts: 40 })

      vi.useRealTimers()
    })

    it('should bypass cached pending transactions while polling', async () => {
      vi.useFakeTimers()

      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({
          error: null,
          data: {
            transaction: {
              hash: '0x123',
              status: TransactionStatus.Pending,
              receipts: [],
            },
          },
        })
        .mockResolvedValueOnce({
          error: null,
          data: {
            transaction: {
              hash: '0x123',
              blockNum: 10,
              status: TransactionStatus.Success,
              receipts: [],
            },
          },
        })
      // @ts-expect-error - accessing private property for testing
      provider.apiClient.get = mockGet

      const promise = provider.waitForTransaction('0x123' as TransactionHash)

      await vi.advanceTimersByTimeAsync(3000)

      const tx = await promise
      expect(tx?.status).toBe(TransactionStatus.Success)
      expect(mockGet).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('should reject immediately when transaction lookup returns a non-404 error', async () => {
      const onProgress = vi.fn()
      const getTransaction = vi
        .spyOn(provider, 'getTransaction')
        .mockRejectedValue(new Error('HTTP 500: Internal Server Error'))

      await expect(
        provider.waitForTransaction('0x123' as TransactionHash, undefined, onProgress),
      ).rejects.toThrow('Error while waiting for transaction: HTTP 500: Internal Server Error')

      expect(getTransaction).toHaveBeenCalledTimes(1)
      expect(onProgress).not.toHaveBeenCalled()
    })

    it('should reject when confirmation block lookup returns HTTP 404', async () => {
      const confirmedTx: ITransactionResponse = {
        hash: '0x123',
        blockNum: 10,
        sender: 'klv1sender',
        nonce: 1,
        timestamp: 1234567890,
        kAppFee: 0,
        bandwidthFee: 0,
        totalFee: 0,
        status: TransactionStatus.Success,
        version: 1,
        chainID: '1001',
        signature: [],
        receipts: [],
      }
      const onProgress = vi.fn()
      const getTransaction = vi.spyOn(provider, 'getTransaction').mockResolvedValue(confirmedTx)
      const getBlockNumber = vi
        .spyOn(provider, 'getBlockNumber')
        .mockRejectedValue(new Error('HTTP 404: Not Found'))

      await expect(
        provider.waitForTransaction('0x123' as TransactionHash, 2, onProgress),
      ).rejects.toThrow('Error while waiting for transaction: HTTP 404: Not Found')

      expect(getTransaction).toHaveBeenCalledTimes(1)
      expect(getBlockNumber).toHaveBeenCalledTimes(1)
      expect(onProgress).not.toHaveBeenCalled()
    })
  })

  describe('event listeners', () => {
    it('should register event listener', () => {
      const listener = vi.fn()
      expect(() => provider.on('block', listener)).not.toThrow()
    })

    it('should unregister event listener', () => {
      const listener = vi.fn()
      expect(() => provider.off('block', listener)).not.toThrow()
    })

    it('on() — listener is called when emitter fires the event', () => {
      const listener = vi.fn()
      provider.on('error', listener)
      // Access the internal emitter to trigger a test event
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('error', { code: 'TEST', message: 'test error' })
      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith({ code: 'TEST', message: 'test error' })
    })

    it('off() — listener is no longer called after removal', () => {
      const listener = vi.fn()
      provider.on('error', listener)
      provider.off('error', listener)
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('error', { code: 'TEST', message: 'test error' })
      expect(listener).not.toHaveBeenCalled()
    })

    it('once() — listener is called exactly once then auto-removed', () => {
      const listener = vi.fn()
      provider.once('error', listener)
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('error', { code: 'A', message: 'first' })
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('error', { code: 'B', message: 'second' })
      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith({ code: 'A', message: 'first' })
    })

    it('removeAllListeners(event) — removes all listeners for that event', () => {
      const l1 = vi.fn()
      const l2 = vi.fn()
      provider.on('error', l1)
      provider.on('error', l2)
      provider.removeAllListeners('error')
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('error', { code: 'TEST', message: 'test' })
      expect(l1).not.toHaveBeenCalled()
      expect(l2).not.toHaveBeenCalled()
    })

    it('removeAllListeners() with no args — removes all listeners across all events', () => {
      const blockListener = vi.fn()
      const errorListener = vi.fn()
      provider.on('block', blockListener)
      provider.on('error', errorListener)
      provider.removeAllListeners()
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('block', { blockNumber: 1, hash: '', timestamp: 0 })
      // @ts-expect-error - accessing private property for testing
      provider._emitter.emit('error', { code: 'TEST', message: 'test' })
      expect(blockListener).not.toHaveBeenCalled()
      expect(errorListener).not.toHaveBeenCalled()
    })
  })

  describe('connect / disconnect', () => {
    it('connect() creates an event manager', () => {
      provider.connect()
      // @ts-expect-error - accessing private property for testing
      expect(provider._eventManager).not.toBeNull()
      provider.disconnect()
    })

    it('connect() is a no-op when already connected', () => {
      provider.connect()
      // @ts-expect-error - accessing private property for testing
      const firstManager = provider._eventManager
      provider.connect()
      // @ts-expect-error - accessing private property for testing
      expect(provider._eventManager).toBe(firstManager)
      provider.disconnect()
    })

    it('disconnect() disposes the event manager', () => {
      provider.connect()
      // @ts-expect-error - accessing private property for testing
      expect(provider._eventManager).not.toBeNull()
      provider.disconnect()
      // @ts-expect-error - accessing private property for testing
      expect(provider._eventManager).toBeNull()
    })

    it('disconnect() is a no-op when not connected', () => {
      expect(() => provider.disconnect()).not.toThrow()
    })

    it('connect() then disconnect() then connect() creates a new manager', () => {
      provider.connect()
      // @ts-expect-error - accessing private property for testing
      const firstManager = provider._eventManager
      provider.disconnect()
      provider.connect()
      // @ts-expect-error - accessing private property for testing
      const secondManager = provider._eventManager
      expect(secondManager).not.toBe(firstManager)
      expect(secondManager).not.toBeNull()
      provider.disconnect()
    })
  })

  describe('contract call (TODO)', () => {
    it('should throw not implemented error', async () => {
      await expect(provider.call('/contract/method')).rejects.toThrow('not yet implemented')
    })
  })
})
