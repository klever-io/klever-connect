/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NodeWallet } from '../node'
import type { IProvider } from '@klever/connect-provider'
import { Transaction } from '@klever/connect-transactions'
import { generateKeyPair } from '@klever/connect-crypto'
import { hexEncode } from '@klever/connect-encoding'

// Ensure tests run in Node environment
vi.mock('@klever/connect-core', async () => {
  const actual = await vi.importActual('@klever/connect-core')
  return {
    ...actual,
    isNode: vi.fn(() => true),
    isBrowser: vi.fn(() => false),
  }
})

describe('NodeWallet', () => {
  let mockProvider: IProvider
  let privateKeyHex: string

  beforeEach(async () => {
    const { privateKey } = await generateKeyPair()
    privateKeyHex = hexEncode(privateKey.bytes)

    mockProvider = {
      getBalance: vi.fn(),
      getNonce: vi.fn().mockResolvedValue(1),
      sendRawTransaction: vi.fn().mockResolvedValue('tx-hash-123'),
      sendRawTransactions: vi.fn().mockResolvedValue(['tx-hash-1', 'tx-hash-2']),
      getTransaction: vi.fn(),
      buildTransaction: vi.fn(),
      getAccount: vi.fn().mockResolvedValue({
        balance: BigInt(1000000),
        nonce: 5,
        address: 'klv1test',
      }),
    } as unknown as IProvider
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create NodeWallet with private key', () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      expect(wallet).toBeDefined()
    })

    it('should create NodeWallet without private key', () => {
      const wallet = new NodeWallet(mockProvider)
      expect(wallet).toBeDefined()
    })

    it('should throw error in browser environment', async () => {
      const { isNode } = await import('@klever/connect-core')
      vi.mocked(isNode).mockReturnValueOnce(false)

      expect(() => new NodeWallet(mockProvider, privateKeyHex)).toThrow(
        'NodeWallet can only be used in Node.js environment',
      )
    })

    it('should throw for invalid private key format', () => {
      expect(() => new NodeWallet(mockProvider, 'not-a-valid-hex-key')).toThrow()
    })
  })

  describe('connect', () => {
    it('should connect with valid private key', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      expect(wallet.isConnected()).toBe(true)
      expect(wallet.address).toMatch(/^klv1/)
      expect(wallet.publicKey).toHaveLength(64) // 32 bytes hex
    })

    it('should emit connect event', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      const connectHandler = vi.fn()
      wallet.on('connect', connectHandler)

      await wallet.connect()

      expect(connectHandler).toHaveBeenCalledWith({ address: wallet.address })
    })

    it('should throw when no private key provided', async () => {
      const wallet = new NodeWallet(mockProvider)
      await expect(wallet.connect()).rejects.toThrow('No private key provided')
    })

    it('should return early if already connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()
      const address1 = wallet.address

      await wallet.connect() // Should not throw or change state
      expect(wallet.address).toBe(address1)
    })
  })

  describe('disconnect', () => {
    it('should disconnect wallet', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const disconnectHandler = vi.fn()
      wallet.on('disconnect', disconnectHandler)

      await wallet.disconnect()

      expect(wallet.isConnected()).toBe(false)
      expect(wallet.address).toBe('')
      expect(disconnectHandler).toHaveBeenCalled()
    })

    it('should disconnect and clear private key', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()
      await wallet.disconnect(true)

      expect(wallet.isConnected()).toBe(false)
      await expect(wallet.connect()).rejects.toThrow('No private key provided')
    })

    it('should return early if not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      // Should not throw
      await expect(wallet.disconnect()).resolves.toBeUndefined()
    })
  })

  describe('setPrivateKey', () => {
    it('should set private key when disconnected', () => {
      const wallet = new NodeWallet(mockProvider)
      expect(() => wallet.setPrivateKey(privateKeyHex)).not.toThrow()
    })

    it('should throw when setting key while connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      expect(() => wallet.setPrivateKey(privateKeyHex)).toThrow(
        'Cannot change private key while connected',
      )
    })
  })

  describe('signMessage', () => {
    it('should sign a string message', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const signature = await wallet.signMessage('Hello, Klever!')
      expect(signature).toBeDefined()
      expect(signature.bytes.length).toBe(64)
      expect(signature.hex).toHaveLength(128)
    })

    it('should sign raw bytes', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const message = new Uint8Array([1, 2, 3, 4])
      const signature = await wallet.signMessage(message)
      expect(signature.bytes.length).toBe(64)
    })

    it('should throw when not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await expect(wallet.signMessage('test')).rejects.toThrow('Wallet not connected')
    })
  })

  describe('verifyMessage', () => {
    it('should verify a valid signature', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const message = 'Hello, Klever!'
      const signature = await wallet.signMessage(message)
      const isValid = await wallet.verifyMessage(message, signature)
      expect(isValid).toBe(true)
    })

    it('should verify with hex string signature', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const message = 'test message'
      const signature = await wallet.signMessage(message)
      const isValid = await wallet.verifyMessage(message, signature.toHex())
      expect(isValid).toBe(true)
    })

    it('should verify with base64 string signature', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const message = 'test message'
      const signature = await wallet.signMessage(message)
      const isValid = await wallet.verifyMessage(message, signature.toBase64())
      expect(isValid).toBe(true)
    })

    it('should return false for invalid signature', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const isValid = await wallet.verifyMessage('test', '00'.repeat(64))
      expect(isValid).toBe(false)
    })
  })

  describe('signTransaction', () => {
    it('should sign a transaction', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const tx = new Transaction({
        RawData: {
          Sender: new Uint8Array(32),
          Nonce: 1,
          Contract: [],
        },
      })

      const signedTx = await wallet.signTransaction(tx)
      expect(signedTx.isSigned()).toBe(true)
    })

    it('should throw when not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      const tx = new Transaction({
        RawData: { Sender: new Uint8Array(32), Nonce: 1, Contract: [] },
      })

      await expect(wallet.signTransaction(tx)).rejects.toThrow('Wallet not connected')
    })
  })

  describe('broadcastTransaction', () => {
    it('should broadcast a signed transaction', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const tx = new Transaction({
        RawData: { Sender: new Uint8Array(32), Nonce: 1, Contract: [] },
        Signature: [new Uint8Array(64)],
      })

      const hash = await wallet.broadcastTransaction(tx)
      expect(hash).toBe('tx-hash-123')
      expect(mockProvider.sendRawTransaction).toHaveBeenCalled()
    })

    it('should throw when not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      const tx = new Transaction({
        RawData: { Sender: new Uint8Array(32), Nonce: 1, Contract: [] },
        Signature: [new Uint8Array(64)],
      })

      await expect(wallet.broadcastTransaction(tx)).rejects.toThrow('Wallet not connected')
    })

    it('should throw when transaction is not signed', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const unsignedTx = new Transaction({
        RawData: { Sender: new Uint8Array(32), Nonce: 1, Contract: [] },
      })

      await expect(wallet.broadcastTransaction(unsignedTx)).rejects.toThrow(
        'Transaction must be signed',
      )
    })
  })

  describe('getBalance', () => {
    it('should get wallet balance', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const balance = await wallet.getBalance()
      expect(balance).toBe(BigInt(1000000))
    })

    it('should throw when not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await expect(wallet.getBalance()).rejects.toThrow('Wallet not connected')
    })
  })

  describe('getNonce', () => {
    it('should get wallet nonce', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const nonce = await wallet.getNonce()
      expect(nonce).toBe(5)
    })

    it('should throw when not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await expect(wallet.getNonce()).rejects.toThrow('Wallet not connected')
    })
  })

  describe('encrypt', () => {
    it('should encrypt private key to keystore', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await wallet.connect()

      const keystore = await wallet.encrypt('test-password', { scryptN: 4096 })
      expect(keystore).toBeDefined()
      expect(keystore.version).toBe(1)
    }, 10000)

    it('should throw when not connected', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      await expect(wallet.encrypt('password')).rejects.toThrow('Wallet must be connected')
    })
  })

  describe('generate', () => {
    it('should generate a new wallet', async () => {
      const wallet = await NodeWallet.generate(mockProvider)
      expect(wallet).toBeDefined()
      await wallet.connect()
      expect(wallet.address).toMatch(/^klv1/)
    })
  })

  describe('event system', () => {
    it('should handle on/off event listeners', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      const handler = vi.fn()

      wallet.on('connect', handler)
      wallet.off('connect', handler)

      await wallet.connect()
      expect(handler).not.toHaveBeenCalled()
    })

    it('should remove all listeners', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      const connectHandler = vi.fn()
      const disconnectHandler = vi.fn()

      wallet.on('connect', connectHandler)
      wallet.on('disconnect', disconnectHandler)
      wallet.removeAllListeners()

      await wallet.connect()
      await wallet.disconnect()

      expect(connectHandler).not.toHaveBeenCalled()
      expect(disconnectHandler).not.toHaveBeenCalled()
    })

    it('should remove listeners for specific event', async () => {
      const wallet = new NodeWallet(mockProvider, privateKeyHex)
      const connectHandler = vi.fn()
      const disconnectHandler = vi.fn()

      wallet.on('connect', connectHandler)
      wallet.on('disconnect', disconnectHandler)
      wallet.removeAllListeners('connect')

      await wallet.connect()
      await wallet.disconnect()

      expect(connectHandler).not.toHaveBeenCalled()
      expect(disconnectHandler).toHaveBeenCalled()
    })
  })
})
