/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WalletFactory, createWallet, NodeWallet, BrowserWallet } from '../wallet-factory'
import type { IProvider } from '@klever/connect-provider'
import { generateKeyPair } from '@klever/connect-crypto'
import { hexEncode } from '@klever/connect-encoding'

// Mock detectEnvironment from connect-core
vi.mock('@klever/connect-core', async () => {
  const actual = await vi.importActual('@klever/connect-core')
  return {
    ...actual,
    detectEnvironment: vi.fn(() => 'node'),
    isNode: vi.fn(() => true),
    isBrowser: vi.fn(() => false),
  }
})

// Mock KleverProvider
vi.mock('@klever/connect-provider', async () => {
  const actual = await vi.importActual('@klever/connect-provider')
  return {
    ...actual,
    KleverProvider: vi.fn().mockImplementation(() => ({
      getAccount: vi.fn().mockResolvedValue({ balance: BigInt(0), nonce: 0 }),
      sendRawTransaction: vi.fn(),
      sendRawTransactions: vi.fn(),
      buildTransaction: vi.fn(),
    })),
  }
})

describe('WalletFactory', () => {
  let mockProvider: IProvider
  let privateKeyHex: string

  beforeEach(async () => {
    vi.clearAllMocks()
    const { privateKey } = await generateKeyPair()
    privateKeyHex = hexEncode(privateKey.bytes)

    mockProvider = {
      getAccount: vi.fn().mockResolvedValue({ balance: BigInt(1000000), nonce: 5 }),
      sendRawTransaction: vi.fn().mockResolvedValue('tx-hash'),
      sendRawTransactions: vi.fn().mockResolvedValue(['tx-hash']),
      buildTransaction: vi.fn(),
    } as unknown as IProvider
  })

  describe('constructor', () => {
    it('should create factory with default provider', () => {
      const factory = new WalletFactory()
      expect(factory).toBeDefined()
    })

    it('should create factory with custom provider', () => {
      const factory = new WalletFactory(mockProvider)
      expect(factory).toBeDefined()
    })
  })

  describe('createWallet', () => {
    it('should create NodeWallet in node environment', async () => {
      const factory = new WalletFactory(mockProvider)
      const wallet = await factory.createWallet({ privateKey: privateKeyHex })
      expect(wallet).toBeInstanceOf(NodeWallet)
    })

    it('should throw in react-native environment', async () => {
      const { detectEnvironment } = await import('@klever/connect-core')
      vi.mocked(detectEnvironment).mockReturnValueOnce('react-native')

      const factory = new WalletFactory(mockProvider)
      await expect(factory.createWallet({ privateKey: privateKeyHex })).rejects.toThrow(
        'React Native wallet not implemented yet',
      )
    })

    it('should throw in unknown environment', async () => {
      const { detectEnvironment } = await import('@klever/connect-core')
      vi.mocked(detectEnvironment).mockReturnValueOnce('unknown' as any)

      const factory = new WalletFactory(mockProvider)
      await expect(factory.createWallet({ privateKey: privateKeyHex })).rejects.toThrow(
        'Unsupported environment',
      )
    })

    it('should throw in node environment without private key', async () => {
      const factory = new WalletFactory(mockProvider)
      await expect(factory.createWallet()).rejects.toThrow(
        'Private key is required for Node.js environment',
      )
    })

    it('should use custom network from config', async () => {
      const { KleverProvider } = await import('@klever/connect-provider')
      const factory = new WalletFactory()
      await factory.createWallet({ privateKey: privateKeyHex, network: 'testnet' })
      expect(KleverProvider).toHaveBeenCalledWith({ network: 'testnet' })
    })

    it('should use custom provider from config', async () => {
      const factory = new WalletFactory()
      const wallet = await factory.createWallet({
        privateKey: privateKeyHex,
        provider: mockProvider,
      })
      expect(wallet).toBeInstanceOf(NodeWallet)
    })
  })

  describe('createRandom', () => {
    it('should create a random wallet in node environment', async () => {
      const factory = new WalletFactory(mockProvider)
      const wallet = await factory.createRandom()
      expect(wallet).toBeInstanceOf(NodeWallet)
    })

    it('should create a random wallet with custom provider', async () => {
      const factory = new WalletFactory()
      const wallet = await factory.createRandom(mockProvider)
      expect(wallet).toBeInstanceOf(NodeWallet)
    })

    it('should throw in react-native environment', async () => {
      const { detectEnvironment } = await import('@klever/connect-core')
      vi.mocked(detectEnvironment).mockReturnValueOnce('react-native')

      const factory = new WalletFactory(mockProvider)
      await expect(factory.createRandom()).rejects.toThrow(
        'React Native wallet not implemented yet',
      )
    })
  })

  describe('mnemonicToPrivateKey', () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

    it('should convert mnemonic to private key hex', () => {
      const factory = new WalletFactory()
      const key = factory.mnemonicToPrivateKey(testMnemonic)
      expect(typeof key).toBe('string')
      expect(key).toHaveLength(64) // 32 bytes = 64 hex chars
    })

    it('should accept custom options', () => {
      const factory = new WalletFactory()
      const key1 = factory.mnemonicToPrivateKey(testMnemonic)
      const key2 = factory.mnemonicToPrivateKey(testMnemonic, {
        path: "m/44'/690'/0'/0'/1'",
      })
      expect(key1).not.toBe(key2)
    })
  })

  describe('fromMnemonic', () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

    it('should create wallet from mnemonic in node environment', async () => {
      const factory = new WalletFactory(mockProvider)
      const wallet = await factory.fromMnemonic(testMnemonic)
      expect(wallet).toBeInstanceOf(NodeWallet)
    })

    it('should create wallet with custom provider', async () => {
      const factory = new WalletFactory()
      const wallet = await factory.fromMnemonic(testMnemonic, mockProvider)
      expect(wallet).toBeInstanceOf(NodeWallet)
    })

    it('should throw in react-native environment', async () => {
      const { detectEnvironment } = await import('@klever/connect-core')
      vi.mocked(detectEnvironment).mockReturnValueOnce('react-native')

      const factory = new WalletFactory(mockProvider)
      await expect(factory.fromMnemonic(testMnemonic)).rejects.toThrow(
        'React Native wallet not implemented yet',
      )
    })
  })

  describe('fromEncryptedJson', () => {
    it('should create wallet from encrypted keystore', async () => {
      // First create a keystore
      const factory = new WalletFactory(mockProvider)
      const wallet = (await factory.createWallet({ privateKey: privateKeyHex })) as NodeWallet
      await wallet.connect()
      const keystore = await wallet.encrypt('test-password', { scryptN: 4096 })

      // Then restore from it
      const restoredWallet = await factory.fromEncryptedJson(keystore, 'test-password')
      expect(restoredWallet).toBeInstanceOf(NodeWallet)
    }, 15000)

    it('should accept JSON string keystore', async () => {
      const factory = new WalletFactory(mockProvider)
      const wallet = (await factory.createWallet({ privateKey: privateKeyHex })) as NodeWallet
      await wallet.connect()
      const keystore = await wallet.encrypt('test-password', { scryptN: 4096 })

      const restoredWallet = await factory.fromEncryptedJson(
        JSON.stringify(keystore),
        'test-password',
      )
      expect(restoredWallet).toBeInstanceOf(NodeWallet)
    }, 15000)

    it('should throw on wrong password', async () => {
      const factory = new WalletFactory(mockProvider)
      const wallet = (await factory.createWallet({ privateKey: privateKeyHex })) as NodeWallet
      await wallet.connect()
      const keystore = await wallet.encrypt('correct-password', { scryptN: 4096 })

      await expect(factory.fromEncryptedJson(keystore, 'wrong-password')).rejects.toThrow()
    }, 15000)
  })

  describe('browser environment', () => {
    it('should create BrowserWallet in browser environment', async () => {
      const { detectEnvironment, isBrowser } = await import('@klever/connect-core')
      vi.mocked(detectEnvironment).mockReturnValue('browser')
      vi.mocked(isBrowser).mockReturnValue(true)

      // Setup browser globals
      const originalWindow = global.window
      global.window = {
        kleverHub: {
          initialize: vi.fn().mockResolvedValue(undefined),
          onAccountChanged: vi.fn(),
          disconnect: vi.fn().mockResolvedValue(undefined),
        },
        kleverWeb: {
          address: 'klv1test',
          getWalletAddress: vi.fn().mockReturnValue('klv1test'),
          getProvider: vi.fn().mockReturnValue({}),
        },
      } as unknown as Window & typeof globalThis

      try {
        const factory = new WalletFactory(mockProvider)
        const wallet = await factory.createWallet({ privateKey: privateKeyHex })
        expect(wallet).toBeInstanceOf(BrowserWallet)
      } finally {
        global.window = originalWindow
        vi.mocked(detectEnvironment).mockReturnValue('node')
        vi.mocked(isBrowser).mockReturnValue(false)
      }
    })
  })
})

describe('createWallet', () => {
  let privateKeyHex: string

  beforeEach(async () => {
    vi.clearAllMocks()
    const { privateKey } = await generateKeyPair()
    privateKeyHex = hexEncode(privateKey.bytes)
  })

  it('should create a wallet using the convenience function', async () => {
    const wallet = await createWallet({ privateKey: privateKeyHex })
    expect(wallet).toBeInstanceOf(NodeWallet)
  })
})
