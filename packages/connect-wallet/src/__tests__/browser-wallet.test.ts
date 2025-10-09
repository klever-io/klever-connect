/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserWallet } from '../browser'
import type { KleverWeb, KleverHub } from '../types/browser-types'
import type { IProvider } from '@klever/connect-provider'
import { Transaction } from '@klever/connect-transactions'

// Mock dependencies
vi.mock('@klever/connect-core', async () => {
  const actual = await vi.importActual('@klever/connect-core')
  return {
    ...actual,
    isBrowser: vi.fn(() => true),
  }
})

describe('BrowserWallet', () => {
  let mockProvider: IProvider
  let mockKleverWeb: KleverWeb
  let mockKleverHub: KleverHub
  let originalWindow: typeof global.window

  beforeEach(() => {
    // Save original window
    originalWindow = global.window

    // Mock provider
    mockProvider = {
      getBalance: vi.fn(),
      getNonce: vi.fn().mockResolvedValue(1),
      sendRawTransaction: vi.fn(),
      getTransaction: vi.fn(),
      buildTransaction: vi.fn(),
      sendRawTransactions: vi.fn(),
      getAccount: vi.fn(),
    } as unknown as IProvider

    // Mock KleverHub
    mockKleverHub = {
      initialize: vi.fn().mockResolvedValue(undefined),
      onAccountChanged: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(undefined),
    }

    // Mock KleverWeb
    mockKleverWeb = {
      address: 'klv1test',
      provider: {},
      createAccount: vi.fn().mockResolvedValue({
        privateKey: 'test-private-key',
        address: 'klv1new',
      }),
      getAccount: vi.fn().mockResolvedValue({
        address: 'klv1test',
        balance: 1000000,
        nonce: 5,
      }),
      parsePemFileData: vi.fn().mockResolvedValue({
        privateKey: 'pem-private-key',
        address: 'klv1pem',
      }),
      broadcastTransactions: vi.fn().mockResolvedValue({
        data: { txsHashes: ['tx-hash-123'] },
        error: '',
      }),
      signTransaction: vi.fn().mockImplementation((txJson) => {
        // Extension receives JSON and returns JSON with Signature added
        const result = {
          ...txJson,
          Signature: [Buffer.from(new Uint8Array(64)).toString('base64')],
        }
        return Promise.resolve(result)
      }),
      setWalletAddress: vi.fn().mockResolvedValue(undefined),
      setPrivateKey: vi.fn().mockResolvedValue(undefined),
      getWalletAddress: vi.fn().mockReturnValue('klv1test'),
      getProvider: vi.fn().mockReturnValue({}),
      signMessage: vi.fn().mockResolvedValue('a'.repeat(128)) /* 64 bytes = 128 hex chars */,
      validateSignature: vi.fn().mockResolvedValue({
        isValid: true,
        signer: 'klv1test',
      }),
      buildTransaction: vi.fn().mockResolvedValue(
        new Transaction({
          RawData: {
            Sender: new Uint8Array(32),
            Nonce: 1,
            Contract: [],
          },
        }),
      ),
    }

    // Setup global window with mocks
    global.window = {
      ...originalWindow,
      kleverWeb: mockKleverWeb,
      kleverHub: mockKleverHub,
    } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    global.window = originalWindow
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create instance in extension mode by default', () => {
      const wallet = new BrowserWallet(mockProvider)
      expect(wallet).toBeDefined()
    })

    it('should create instance in private key mode when privateKey provided', () => {
      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      expect(wallet).toBeDefined()
    })

    it('should create instance in PEM mode when pemContent provided', () => {
      const wallet = new BrowserWallet(mockProvider, {
        pemContent: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
      })
      expect(wallet).toBeDefined()
    })

    it('should throw error if not in browser environment', async () => {
      const { isBrowser } = await import('@klever/connect-core')
      vi.mocked(isBrowser).mockReturnValueOnce(false)

      expect(() => new BrowserWallet(mockProvider)).toThrow(
        'BrowserWallet can only be used in browser environment',
      )
    })
  })

  describe('Extension Mode - Connect/Disconnect', () => {
    it('should connect successfully with extension', async () => {
      const wallet = new BrowserWallet(mockProvider)
      const connectSpy = vi.fn()
      wallet.on('connect', connectSpy)

      await wallet.connect()

      expect(wallet.isConnected()).toBe(true)
      expect(wallet.address).toBe('klv1test')
      expect(mockKleverHub.initialize).toHaveBeenCalled()
      expect(connectSpy).toHaveBeenCalledWith({ address: 'klv1test' })
    })

    it('should throw error if extension not found', async () => {
      global.window.kleverWeb = undefined

      const wallet = new BrowserWallet(mockProvider)

      await expect(wallet.connect()).rejects.toThrow('Klever Extension not found')
    })

    it('should throw error if no wallet address in extension', async () => {
      mockKleverWeb.getWalletAddress = vi.fn().mockReturnValue('')

      const wallet = new BrowserWallet(mockProvider)

      await expect(wallet.connect()).rejects.toThrow('No wallet address set in Klever Extension')
    })

    it('should disconnect successfully', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const disconnectSpy = vi.fn()
      wallet.on('disconnect', disconnectSpy)

      await wallet.disconnect()

      expect(wallet.isConnected()).toBe(false)
      expect(wallet.address).toBe('')
      expect(mockKleverHub.disconnect).toHaveBeenCalled()
      expect(disconnectSpy).toHaveBeenCalled()
    })

    it('should handle account changes', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const accountChangedSpy = vi.fn()
      wallet.on('accountChanged', accountChangedSpy)

      // Simulate account change
      const onAccountChangedCallback = vi.mocked(mockKleverHub.onAccountChanged).mock.calls[0][0]
      onAccountChangedCallback({ chain: 'KLV', address: 'klv1new' })

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(accountChangedSpy).toHaveBeenCalledWith({
        address: 'klv1new',
        chain: 'KLV',
      })
    })

    it('should disconnect when different chain selected', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const disconnectSpy = vi.fn()
      wallet.on('disconnect', disconnectSpy)

      // Simulate chain change
      const onAccountChangedCallback = vi.mocked(mockKleverHub.onAccountChanged).mock.calls[0][0]
      onAccountChangedCallback({ chain: 'ETH', address: 'eth-address' })

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(wallet.isConnected()).toBe(false)
      expect(disconnectSpy).toHaveBeenCalled()
    })
  })

  describe('Extension Mode - Signing', () => {
    it('should sign message using extension', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const signature = await wallet.signMessage('test message')

      expect(signature).toBeDefined()
      expect(signature.hex).toBe('a'.repeat(128))
      expect(signature.bytes.length).toBe(64)
      expect(mockKleverWeb.signMessage).toHaveBeenCalledWith('test message')
    })

    it('should sign message with Uint8Array using extension', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const messageBytes = new Uint8Array([1, 2, 3])
      await wallet.signMessage(messageBytes)

      expect(mockKleverWeb.signMessage).toHaveBeenCalledWith('010203')
    })

    it('should sign transaction using extension', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const unsignedTx = new Transaction({
        RawData: {
          Sender: new Uint8Array(32),
          Nonce: 1,
          Contract: [],
        },
      })

      const signedTx = await wallet.signTransaction(unsignedTx)

      expect(signedTx).toBeDefined()
      expect(signedTx.isSigned()).toBe(true)
      // Extension receives JSON, not Transaction object
      expect(mockKleverWeb.signTransaction).toHaveBeenCalledWith(unsignedTx.toJSON())
    })

    it('should throw error when signing without connection', async () => {
      const wallet = new BrowserWallet(mockProvider)

      await expect(wallet.signMessage('test')).rejects.toThrow('Wallet not connected')
    })
  })

  describe('Extension Mode - Transactions', () => {
    it('should build transaction using extension', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const tx = await wallet.buildTransaction([
        {
          contractType: 0,
          receiver: 'klv1recipient',
          amount: 1000000,
        },
      ])

      expect(tx).toBeDefined()
      expect(mockKleverWeb.buildTransaction).toHaveBeenCalled()
    })

    it('should broadcast transactions using extension', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const signedTx = new Transaction({
        RawData: {
          Sender: new Uint8Array(32),
          Nonce: 1,
          Contract: [],
        },
        Signature: [new Uint8Array(64)],
      })

      const hashes = await wallet.broadcastTransactions([signedTx])

      expect(hashes).toEqual(['tx-hash-123'])
      expect(mockKleverWeb.broadcastTransactions).toHaveBeenCalledWith([signedTx])
    })

    it('should build and sign transfer', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const tx = await wallet.buildTransfer('klv1recipient', 1000000)

      expect(tx).toBeDefined()
      expect(mockKleverWeb.buildTransaction).toHaveBeenCalled()
      expect(mockKleverWeb.signTransaction).toHaveBeenCalled()
    })

    it('should build transfer with token', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      await wallet.buildTransfer('klv1recipient', 1000000, 'KDA-TOKEN')

      const buildCall = vi.mocked(mockKleverWeb.buildTransaction).mock.calls[0]
      const contract = buildCall[0][0].payload as { kda?: string; assetId?: string }
      expect(contract.kda).toBe('KDA-TOKEN')
      expect(contract.assetId).toBe('KDA-TOKEN')
    })
  })

  describe('Extension Mode - Extension-Only Methods', () => {
    it('should create account', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const account = await wallet.createAccount()

      expect(account.privateKey).toBe('test-private-key')
      expect(account.address).toBe('klv1new')
      expect(mockKleverWeb.createAccount).toHaveBeenCalled()
    })

    it('should get account info', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const account = await wallet.getAccount()

      expect(account.address).toBe('klv1test')
      expect(account.balance).toBe(1000000)
      expect(account.nonce).toBe(5)
      expect(mockKleverWeb.getAccount).toHaveBeenCalled()
    })

    it('should parse PEM file data', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const pemResult = await wallet.parsePemFileData('pem-content')

      expect(pemResult.privateKey).toBe('pem-private-key')
      expect(pemResult.address).toBe('klv1pem')
      expect(mockKleverWeb.parsePemFileData).toHaveBeenCalledWith('pem-content')
    })

    it('should set wallet address', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      await wallet.setWalletAddress('klv1newaddress')

      expect(wallet.address).toBe('klv1newaddress')
      expect(mockKleverWeb.setWalletAddress).toHaveBeenCalledWith('klv1newaddress')
    })

    it('should set private key', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      await wallet.setPrivateKey('new-private-key')

      expect(mockKleverWeb.setPrivateKey).toHaveBeenCalledWith('new-private-key')
    })

    it('should validate signature', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const result = await wallet.validateSignature('signature-payload')

      expect(result.isValid).toBe(true)
      expect(result.signer).toBe('klv1test')
      expect(mockKleverWeb.validateSignature).toHaveBeenCalledWith('signature-payload')
    })

    it('should throw error for extension-only methods without extension', async () => {
      global.window.kleverWeb = undefined
      const wallet = new BrowserWallet(mockProvider, { privateKey: 'a'.repeat(64) })
      await wallet.connect()

      // These methods are extension-only (no provider fallback)
      await expect(wallet.createAccount()).rejects.toThrow('KleverWeb extension not available')
      await expect(wallet.parsePemFileData('pem')).rejects.toThrow(
        'KleverWeb extension not available',
      )
      await expect(wallet.setWalletAddress('klv1test')).rejects.toThrow(
        'KleverWeb extension not available',
      )
      await expect(wallet.setPrivateKey('key')).rejects.toThrow('KleverWeb extension not available')
      await expect(wallet.validateSignature('sig')).rejects.toThrow(
        'KleverWeb extension not available',
      )
    })
  })

  describe('Extension Mode - Provider Management', () => {
    it('should get extension provider', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const provider = wallet.getExtensionProvider()

      expect(provider).toBeDefined()
      expect(mockKleverWeb.getProvider).toHaveBeenCalled()
    })

    it('should return empty object if no extension', () => {
      global.window.kleverWeb = undefined
      const wallet = new BrowserWallet(mockProvider, { privateKey: 'a'.repeat(64) })

      const provider = wallet.getExtensionProvider()

      expect(provider).toEqual({})
    })

    it('should update provider', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const newProvider = { api: 'https://api.testnet.klever.finance' }
      wallet.updateProvider(newProvider)

      expect(mockKleverWeb.provider).toBe(newProvider)
    })

    it('should return early when updating NetworkURI without extension', () => {
      global.window.kleverWeb = undefined
      const wallet = new BrowserWallet(mockProvider, { privateKey: 'a'.repeat(64) })

      // NetworkURI requires extension to be available - should return early without error
      const networkConfig = { api: 'https://api.testnet.klever.finance' }
      expect(() => wallet.updateProvider(networkConfig)).not.toThrow()
    })
  })

  describe('Private Key Mode', () => {
    it('should connect in private key mode', async () => {
      global.window.kleverWeb = undefined
      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })

      await wallet.connect()

      expect(wallet.isConnected()).toBe(true)
      expect(wallet.address).toBeDefined()
    })

    it('should sign message in private key mode', async () => {
      global.window.kleverWeb = undefined
      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      await wallet.connect()

      const signature = await wallet.signMessage('test message')

      expect(signature).toBeDefined()
      expect(signature.bytes).toBeDefined()
      expect(signature.bytes.length).toBe(64)
      expect(signature.hex).toBeDefined()
    })

    it('should sign transaction in private key mode', async () => {
      global.window.kleverWeb = undefined
      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      await wallet.connect()

      const unsignedTx = new Transaction({
        RawData: {
          Sender: new Uint8Array(32),
          Nonce: 1,
          Contract: [],
        },
      })

      const signedTx = await wallet.signTransaction(unsignedTx)

      expect(signedTx.isSigned()).toBe(true)
    })

    it('should use base implementation for sendTransaction in private key mode', async () => {
      global.window.kleverWeb = undefined
      ;(mockProvider.sendRawTransaction as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash')

      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      await wallet.connect()

      // Mock buildTransaction for TransactionBuilder
      ;(mockProvider.buildTransaction as ReturnType<typeof vi.fn>).mockResolvedValue({
        result: {
          RawData: {
            Sender: new Uint8Array(32),
            Nonce: 1,
            Contract: [],
          },
        },
      })

      const result = await wallet.sendTransaction({
        contractType: 0,
        receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
        amount: 1000000,
      })

      expect(result.hash).toBe('tx-hash')
      expect(mockProvider.sendRawTransaction).toHaveBeenCalled()
    })

    it('should build transaction in private key mode', async () => {
      global.window.kleverWeb = undefined
      ;(mockProvider.buildTransaction as ReturnType<typeof vi.fn>).mockResolvedValue({
        result: {
          RawData: {
            Sender: new Uint8Array(32),
            Nonce: 1,
            Contract: [],
          },
        },
      })

      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      await wallet.connect()
      ;(mockProvider.getNonce as ReturnType<typeof vi.fn>).mockResolvedValue(5)

      const tx = await wallet.buildTransaction([
        {
          contractType: 0,
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000,
        },
      ])

      expect(tx).toBeDefined()
      expect(mockProvider.buildTransaction).toHaveBeenCalled()
    })

    it('should broadcast transactions in private key mode', async () => {
      global.window.kleverWeb = undefined
      // Mock the sendRawTransactions method
      ;(mockProvider.sendRawTransactions as ReturnType<typeof vi.fn>).mockResolvedValue([
        'tx-hash-1',
      ])

      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      await wallet.connect()

      const signedTx = new Transaction({
        RawData: {
          Sender: new Uint8Array(32),
          Nonce: 1,
          Contract: [],
        },
        Signature: [new Uint8Array(64)],
      })

      const hashes = await wallet.broadcastTransactions([signedTx])

      expect(hashes).toEqual(['tx-hash-1'])
      expect(mockProvider.sendRawTransactions).toHaveBeenCalledWith([expect.any(Object)])
    })

    it('should get account in private key mode using provider', async () => {
      global.window.kleverWeb = undefined
      ;(mockProvider.getAccount as ReturnType<typeof vi.fn>).mockResolvedValue({
        address: 'klv1test',
        balance: BigInt(1000000),
        nonce: 5,
      })

      const wallet = new BrowserWallet(mockProvider, {
        privateKey: 'a'.repeat(64),
      })
      await wallet.connect()

      const account = await wallet.getAccount()

      expect(account.address).toBe('klv1test')
      expect(account.balance).toBe(1000000)
      expect(account.nonce).toBe(5)
      expect(mockProvider.getAccount).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle extension errors gracefully', async () => {
      mockKleverWeb.signMessage = vi.fn().mockRejectedValue(new Error('Extension error'))

      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      await expect(wallet.signMessage('test')).rejects.toThrow('Failed to sign message')
    })

    it('should handle broadcast errors', async () => {
      mockKleverWeb.broadcastTransactions = vi
        .fn()
        .mockResolvedValue({ error: 'Broadcast failed', data: null })

      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const signedTx = new Transaction({
        RawData: {
          Sender: new Uint8Array(32),
          Nonce: 1,
          Contract: [],
        },
        Signature: [new Uint8Array(64)],
      })

      // sendTransaction uses broadcastTransactions internally
      mockKleverWeb.buildTransaction = vi.fn().mockResolvedValue(signedTx)
      mockKleverWeb.signTransaction = vi.fn().mockResolvedValue(signedTx)

      await expect(
        wallet.sendTransaction({
          contractType: 0,
          receiver: 'klv1test',
          amount: 1000,
        }),
      ).rejects.toThrow('Broadcast failed')
    })
  })

  describe('Event Emitters', () => {
    it('should emit connect event', async () => {
      const wallet = new BrowserWallet(mockProvider)
      const connectHandler = vi.fn()
      wallet.on('connect', connectHandler)

      await wallet.connect()

      expect(connectHandler).toHaveBeenCalledWith({ address: 'klv1test' })
    })

    it('should emit disconnect event', async () => {
      const wallet = new BrowserWallet(mockProvider)
      await wallet.connect()

      const disconnectHandler = vi.fn()
      wallet.on('disconnect', disconnectHandler)

      await wallet.disconnect()

      expect(disconnectHandler).toHaveBeenCalled()
    })

    it('should remove event listeners', async () => {
      const wallet = new BrowserWallet(mockProvider)
      const handler = vi.fn()

      wallet.on('connect', handler)
      wallet.off('connect', handler)

      await wallet.connect()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should remove all listeners', async () => {
      const wallet = new BrowserWallet(mockProvider)
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      wallet.on('connect', handler1)
      wallet.on('disconnect', handler2)

      wallet.removeAllListeners()

      await wallet.connect()
      await wallet.disconnect()

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })
})
