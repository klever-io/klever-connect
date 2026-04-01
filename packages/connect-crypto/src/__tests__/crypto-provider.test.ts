import { describe, it, expect } from 'vitest'
import { cryptoProvider, DefaultCryptoProvider } from '../crypto-provider'
import { PrivateKeyImpl, PublicKeyImpl, generateKeyPair } from '../keys'
import { SignatureImpl } from '../signing'

describe('DefaultCryptoProvider', () => {
  let provider: DefaultCryptoProvider

  beforeEach(() => {
    provider = new DefaultCryptoProvider()
  })

  describe('generateKeyPair', () => {
    it('should generate a key pair', async () => {
      const kp = await provider.generateKeyPair()
      expect(kp.privateKey.bytes.length).toBe(32)
      expect(kp.publicKey.bytes.length).toBe(32)
    })

    it('should generate unique key pairs', async () => {
      const kp1 = await provider.generateKeyPair()
      const kp2 = await provider.generateKeyPair()
      expect(kp1.privateKey.toHex()).not.toBe(kp2.privateKey.toHex())
    })
  })

  describe('importPrivateKey', () => {
    it('should import from hex string', () => {
      const hex = '01'.repeat(32)
      const key = provider.importPrivateKey(hex)
      expect(key.bytes).toEqual(new Uint8Array(32).fill(1))
    })

    it('should import from hex with 0x prefix', () => {
      const hex = '0x' + '01'.repeat(32)
      const key = provider.importPrivateKey(hex)
      expect(key.bytes).toEqual(new Uint8Array(32).fill(1))
    })

    it('should import from Uint8Array', () => {
      const bytes = new Uint8Array(32).fill(2)
      const key = provider.importPrivateKey(bytes)
      expect(key.bytes).toEqual(bytes)
    })

    it('should throw for invalid key length', () => {
      expect(() => provider.importPrivateKey('01'.repeat(16))).toThrow()
    })
  })

  describe('getPublicKey', () => {
    it('should derive public key from private key', async () => {
      const { privateKey } = await generateKeyPair()
      const imported = PrivateKeyImpl.fromBytes(privateKey.bytes)
      const pubKey = await provider.getPublicKey(imported)
      expect(pubKey.bytes.length).toBe(32)
      expect(pubKey).toBeInstanceOf(PublicKeyImpl)
    })

    it('should derive deterministic public key', async () => {
      const { privateKey } = await generateKeyPair()
      const imported = PrivateKeyImpl.fromBytes(privateKey.bytes)
      const pubKey1 = await provider.getPublicKey(imported)
      const pubKey2 = await provider.getPublicKey(imported)
      expect(pubKey1.toHex()).toBe(pubKey2.toHex())
    })
  })

  describe('signMessage', () => {
    it('should sign a message', async () => {
      const { privateKey } = await generateKeyPair()
      const imported = PrivateKeyImpl.fromBytes(privateKey.bytes)
      const message = new TextEncoder().encode('test message')

      const signature = await provider.signMessage(message, imported)
      expect(signature.bytes.length).toBe(64)
      expect(signature).toBeInstanceOf(SignatureImpl)
    })

    it('should produce valid signature', async () => {
      const kp = await generateKeyPair()
      const imported = PrivateKeyImpl.fromBytes(kp.privateKey.bytes)
      const pubKey = PublicKeyImpl.fromBytes(kp.publicKey.bytes)
      const message = new TextEncoder().encode('test')

      const signature = await provider.signMessage(message, imported)
      const isValid = await provider.verifySignature(message, signature, pubKey)
      expect(isValid).toBe(true)
    })
  })

  describe('verifySignature', () => {
    it('should verify valid signature', async () => {
      const kp = await generateKeyPair()
      const privKey = PrivateKeyImpl.fromBytes(kp.privateKey.bytes)
      const pubKey = PublicKeyImpl.fromBytes(kp.publicKey.bytes)
      const message = new TextEncoder().encode('Hello, Klever!')

      const signature = await provider.signMessage(message, privKey)
      const isValid = await provider.verifySignature(message, signature, pubKey)
      expect(isValid).toBe(true)
    })

    it('should reject invalid signature', async () => {
      const kp = await generateKeyPair()
      const pubKey = PublicKeyImpl.fromBytes(kp.publicKey.bytes)
      const message = new TextEncoder().encode('test')
      const fakeSignature = SignatureImpl.fromBytes(new Uint8Array(64))

      const isValid = await provider.verifySignature(message, fakeSignature, pubKey)
      expect(isValid).toBe(false)
    })
  })

  describe('addressToBytes / bytesToAddress', () => {
    it('should convert address to bytes', async () => {
      // Use a known valid address
      const kp = await generateKeyPair()
      const address = kp.publicKey.toAddress()

      const bytes = await provider.addressToBytes(address)
      expect(bytes.length).toBe(32)
      expect(bytes).toEqual(kp.publicKey.bytes)
    })

    it('should convert bytes to address', async () => {
      const kp = await generateKeyPair()
      const address = await provider.bytesToAddress(kp.publicKey.bytes)
      expect(address).toMatch(/^klv1/)
      expect(address).toBe(kp.publicKey.toAddress())
    })

    it('should roundtrip address -> bytes -> address', async () => {
      const kp = await generateKeyPair()
      const originalAddress = kp.publicKey.toAddress()
      const bytes = await provider.addressToBytes(originalAddress)
      const address = await provider.bytesToAddress(bytes)
      expect(address).toBe(originalAddress)
    })
  })

  describe('sign', () => {
    it('should sign data with private key hex', async () => {
      const kp = await generateKeyPair()
      const privKeyHex = kp.privateKey.toHex()
      const message = new TextEncoder().encode('test')

      const signatureBytes = await provider.sign(message, privKeyHex)
      expect(signatureBytes.length).toBe(64)
    })

    it('should produce verifiable signature', async () => {
      const kp = await generateKeyPair()
      const privKeyHex = kp.privateKey.toHex()
      const pubKey = PublicKeyImpl.fromBytes(kp.publicKey.bytes)
      const message = new TextEncoder().encode('test')

      const signatureBytes = await provider.sign(message, privKeyHex)
      const signature = SignatureImpl.fromBytes(signatureBytes)
      const isValid = await provider.verifySignature(message, signature, pubKey)
      expect(isValid).toBe(true)
    })
  })
})

describe('cryptoProvider singleton', () => {
  it('should be a DefaultCryptoProvider instance', () => {
    expect(cryptoProvider).toBeInstanceOf(DefaultCryptoProvider)
  })

  it('should generate key pairs', async () => {
    const kp = await cryptoProvider.generateKeyPair()
    expect(kp.privateKey).toBeDefined()
    expect(kp.publicKey).toBeDefined()
  })
})
