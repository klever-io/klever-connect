import { describe, it, expect } from 'vitest'
import {
  SignatureImpl,
  signMessage,
  signMessageSync,
  verifySignature,
  verifySignatureSync,
} from '../signing'
import { generateKeyPair, generateKeyPairSync, PrivateKeyImpl, PublicKeyImpl } from '../keys'

describe('SignatureImpl', () => {
  const validBytes = new Uint8Array(64).fill(0xab)

  it('should create from 64 bytes', () => {
    const sig = new SignatureImpl(validBytes)
    expect(sig.bytes).toEqual(validBytes)
    expect(sig.bytes.length).toBe(64)
  })

  it('should throw for non-64 byte input', () => {
    expect(() => new SignatureImpl(new Uint8Array(32))).toThrow('Signature must be 64 bytes')
    expect(() => new SignatureImpl(new Uint8Array(65))).toThrow('Signature must be 64 bytes')
  })

  it('should convert to hex', () => {
    const sig = new SignatureImpl(validBytes)
    const hex = sig.toHex()
    expect(hex).toBe('ab'.repeat(64))
    expect(sig.hex).toBe(hex)
  })

  it('should convert to base64', () => {
    const sig = new SignatureImpl(new Uint8Array(64))
    const b64 = sig.toBase64()
    expect(typeof b64).toBe('string')
    expect(b64.length).toBeGreaterThan(0)
  })

  it('should create from hex', () => {
    const hex = 'ab'.repeat(64)
    const sig = SignatureImpl.fromHex(hex)
    expect(sig.bytes).toEqual(validBytes)
  })

  it('should create from base64', () => {
    const original = new SignatureImpl(validBytes)
    const b64 = original.toBase64()
    const restored = SignatureImpl.fromBase64(b64)
    expect(restored.bytes).toEqual(validBytes)
  })

  it('should create from bytes', () => {
    const sig = SignatureImpl.fromBytes(validBytes)
    expect(sig.bytes).toEqual(validBytes)
  })

  it('should roundtrip hex', () => {
    const original = new SignatureImpl(validBytes)
    const restored = SignatureImpl.fromHex(original.toHex())
    expect(restored.bytes).toEqual(original.bytes)
  })

  it('should roundtrip base64', () => {
    const original = new SignatureImpl(validBytes)
    const restored = SignatureImpl.fromBase64(original.toBase64())
    expect(restored.bytes).toEqual(original.bytes)
  })
})

describe('signMessage / verifySignature', () => {
  it('should sign and verify a message asynchronously', async () => {
    const { privateKey, publicKey } = await generateKeyPair()
    const message = new TextEncoder().encode('Hello, Klever!')

    const signatureBytes = await signMessage(message, privateKey.bytes)
    expect(signatureBytes.length).toBe(64)

    const isValid = await verifySignature(message, signatureBytes, publicKey.bytes)
    expect(isValid).toBe(true)
  })

  it('should fail verification with wrong public key', async () => {
    const { privateKey } = await generateKeyPair()
    const { publicKey: wrongPublicKey } = await generateKeyPair()
    const message = new TextEncoder().encode('test message')

    const signatureBytes = await signMessage(message, privateKey.bytes)
    const isValid = await verifySignature(message, signatureBytes, wrongPublicKey.bytes)
    expect(isValid).toBe(false)
  })

  it('should fail verification with tampered message', async () => {
    const { privateKey, publicKey } = await generateKeyPair()
    const message = new TextEncoder().encode('original message')
    const tamperedMessage = new TextEncoder().encode('tampered message')

    const signatureBytes = await signMessage(message, privateKey.bytes)
    const isValid = await verifySignature(tamperedMessage, signatureBytes, publicKey.bytes)
    expect(isValid).toBe(false)
  })

  it('should return false for invalid signature bytes', async () => {
    const { publicKey } = await generateKeyPair()
    const message = new TextEncoder().encode('test')
    const invalidSignature = new Uint8Array(64)

    const isValid = await verifySignature(message, invalidSignature, publicKey.bytes)
    expect(isValid).toBe(false)
  })
})

describe('signMessageSync / verifySignatureSync', () => {
  it('should sign and verify synchronously', () => {
    const { privateKey, publicKey } = generateKeyPairSync()
    const message = new TextEncoder().encode('Hello, Klever!')

    const signatureBytes = signMessageSync(message, privateKey.bytes)
    expect(signatureBytes.length).toBe(64)

    const isValid = verifySignatureSync(message, signatureBytes, publicKey.bytes)
    expect(isValid).toBe(true)
  })

  it('should fail sync verification with wrong key', () => {
    const { privateKey } = generateKeyPairSync()
    const { publicKey: wrongPublicKey } = generateKeyPairSync()
    const message = new TextEncoder().encode('test')

    const sig = signMessageSync(message, privateKey.bytes)
    const isValid = verifySignatureSync(message, sig, wrongPublicKey.bytes)
    expect(isValid).toBe(false)
  })

  it('should return false for invalid signature in sync verify', () => {
    const { publicKey } = generateKeyPairSync()
    const isValid = verifySignatureSync(
      new TextEncoder().encode('test'),
      new Uint8Array(64),
      publicKey.bytes,
    )
    expect(isValid).toBe(false)
  })
})

describe('PrivateKeyImpl', () => {
  it('should create from 32 bytes', () => {
    const bytes = new Uint8Array(32).fill(1)
    const key = new PrivateKeyImpl(bytes)
    expect(key.bytes).toEqual(bytes)
  })

  it('should throw for wrong size', () => {
    expect(() => new PrivateKeyImpl(new Uint8Array(16))).toThrow('Private key must be 32 bytes')
  })

  it('should convert to hex', () => {
    const bytes = new Uint8Array(32).fill(0xff)
    const key = new PrivateKeyImpl(bytes)
    expect(key.toHex()).toBe('ff'.repeat(32))
    expect(key.hex).toBe('ff'.repeat(32))
  })

  it('should create from hex', () => {
    const hex = '01'.repeat(32)
    const key = PrivateKeyImpl.fromHex(hex)
    expect(key.bytes).toEqual(new Uint8Array(32).fill(1))
  })

  it('should create from bytes', () => {
    const bytes = new Uint8Array(32).fill(2)
    const key = PrivateKeyImpl.fromBytes(bytes)
    expect(key.bytes).toEqual(bytes)
  })
})

describe('PublicKeyImpl', () => {
  it('should create from 32 bytes', () => {
    const bytes = new Uint8Array(32).fill(1)
    const key = new PublicKeyImpl(bytes)
    expect(key.bytes).toEqual(bytes)
  })

  it('should throw for wrong size', () => {
    expect(() => new PublicKeyImpl(new Uint8Array(16))).toThrow('Public key must be 32 bytes')
  })

  it('should convert to hex', () => {
    const bytes = new Uint8Array(32).fill(0xcd)
    const key = new PublicKeyImpl(bytes)
    expect(key.toHex()).toBe('cd'.repeat(32))
    expect(key.hex).toBe('cd'.repeat(32))
  })

  it('should convert to klv1 address', () => {
    const bytes = new Uint8Array(32)
    const key = new PublicKeyImpl(bytes)
    const address = key.toAddress()
    expect(address).toMatch(/^klv1/)
  })

  it('should create from hex', () => {
    const hex = '02'.repeat(32)
    const key = PublicKeyImpl.fromHex(hex)
    expect(key.bytes).toEqual(new Uint8Array(32).fill(2))
  })

  it('should create from bytes', () => {
    const bytes = new Uint8Array(32).fill(3)
    const key = PublicKeyImpl.fromBytes(bytes)
    expect(key.bytes).toEqual(bytes)
  })
})

describe('generateKeyPair', () => {
  it('should generate valid key pair asynchronously', async () => {
    const { privateKey, publicKey } = await generateKeyPair()
    expect(privateKey.bytes.length).toBe(32)
    expect(publicKey.bytes.length).toBe(32)
  })

  it('should generate unique key pairs', async () => {
    const kp1 = await generateKeyPair()
    const kp2 = await generateKeyPair()
    expect(kp1.privateKey.toHex()).not.toBe(kp2.privateKey.toHex())
  })

  it('should generate address from key pair', async () => {
    const { publicKey } = await generateKeyPair()
    expect(publicKey.toAddress()).toMatch(/^klv1/)
  })
})

describe('generateKeyPairSync', () => {
  it('should generate valid key pair synchronously', () => {
    const { privateKey, publicKey } = generateKeyPairSync()
    expect(privateKey.bytes.length).toBe(32)
    expect(publicKey.bytes.length).toBe(32)
  })

  it('should generate unique key pairs', () => {
    const kp1 = generateKeyPairSync()
    const kp2 = generateKeyPairSync()
    expect(kp1.privateKey.toHex()).not.toBe(kp2.privateKey.toHex())
  })

  it('should generate address from sync key pair', () => {
    const { publicKey } = generateKeyPairSync()
    expect(publicKey.toAddress()).toMatch(/^klv1/)
  })
})
