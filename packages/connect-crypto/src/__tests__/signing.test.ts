import { describe, it, expect } from 'vitest'
import {
  SignatureImpl,
  signMessage,
  signMessageSync,
  verifySignature,
  verifySignatureSync,
  prepareKlvMessage,
  verifyWalletSignedMessage,
} from '../signing'
import { generateKeyPair, generateKeyPairSync, PrivateKeyImpl, PublicKeyImpl } from '../keys'
import { cryptoProvider } from '../crypto-provider'
import { hexDecode } from '@klever/connect-encoding'
import { keccak_256 } from '@noble/hashes/sha3'

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

describe('prepareKlvMessage', () => {
  it('returns a 32-byte Uint8Array', () => {
    const result = prepareKlvMessage('Hello, Klever!')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.byteLength).toBe(32)
  })

  it('applies the KLV prefix and keccak256 digest correctly', () => {
    const message = 'Hello, Klever!'
    const enc = new TextEncoder()
    const msgBytes = enc.encode(message)
    const prefix = enc.encode('\x17Klever Signed Message:\n')
    const length = enc.encode(String(msgBytes.length))
    const prepared = new Uint8Array(prefix.length + length.length + msgBytes.length)
    prepared.set(prefix, 0)
    prepared.set(length, prefix.length)
    prepared.set(msgBytes, prefix.length + length.length)
    expect(prepareKlvMessage(message)).toEqual(keccak_256(prepared))
  })

  it('produces different digests for different messages', () => {
    const h1 = prepareKlvMessage('message one')
    const h2 = prepareKlvMessage('message two')
    expect(h1).not.toEqual(h2)
  })

  it('verifies against a real Klever browser wallet signature', async () => {
    // Real test vector: signature produced by the Klever extension for the given address and message.
    const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgq0mkvrke3yjeyzafm0mwz6zqjsvppsel0veys5m7dwn'
    const WALLET_ADDRESS = 'klv1fr724pjdjp3l8unuvgda0k6vt06d875hj7t5ggrxymzcg3jcveysejzljc'
    const SIG_HEX =
      '16136cd31025eec41c1fd0d5938a09cb29e098aa2c6449ccdf92d0f8b3f3bce98ff7e45d272931802c68e54187adb33acf50ee14a48242ac2116b8cceae47b04'

    const messageHash = prepareKlvMessage(`Submit validation for contract ${CONTRACT_ADDRESS}`)
    const signatureBytes = hexDecode(SIG_HEX)
    const publicKeyBytes = await cryptoProvider.addressToBytes(WALLET_ADDRESS)

    expect(await verifySignature(messageHash, signatureBytes, publicKeyBytes)).toBe(true)
  })
})

describe('verifyWalletSignedMessage', () => {
  const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgq0mkvrke3yjeyzafm0mwz6zqjsvppsel0veys5m7dwn'
  const WALLET_ADDRESS = 'klv1fr724pjdjp3l8unuvgda0k6vt06d875hj7t5ggrxymzcg3jcveysejzljc'
  const SIG_HEX =
    '16136cd31025eec41c1fd0d5938a09cb29e098aa2c6449ccdf92d0f8b3f3bce98ff7e45d272931802c68e54187adb33acf50ee14a48242ac2116b8cceae47b04'
  const MESSAGE = `Submit validation for contract ${CONTRACT_ADDRESS}`

  it('returns true for a valid real wallet signature', async () => {
    const signatureBytes = hexDecode(SIG_HEX)
    const publicKeyBytes = await cryptoProvider.addressToBytes(WALLET_ADDRESS)
    expect(await verifyWalletSignedMessage(MESSAGE, signatureBytes, publicKeyBytes)).toBe(true)
  })

  it('returns false for a tampered signature', async () => {
    const tampered = SIG_HEX.slice(0, -2) + (SIG_HEX.endsWith('04') ? '05' : '04')
    const signatureBytes = hexDecode(tampered)
    const publicKeyBytes = await cryptoProvider.addressToBytes(WALLET_ADDRESS)
    expect(await verifyWalletSignedMessage(MESSAGE, signatureBytes, publicKeyBytes)).toBe(false)
  })

  it('returns false for the wrong message', async () => {
    const signatureBytes = hexDecode(SIG_HEX)
    const publicKeyBytes = await cryptoProvider.addressToBytes(WALLET_ADDRESS)
    expect(await verifyWalletSignedMessage('wrong message', signatureBytes, publicKeyBytes)).toBe(
      false,
    )
  })

  it('returns false for the wrong public key', async () => {
    const signatureBytes = hexDecode(SIG_HEX)
    const publicKeyBytes = await cryptoProvider.addressToBytes(CONTRACT_ADDRESS)
    expect(await verifyWalletSignedMessage(MESSAGE, signatureBytes, publicKeyBytes)).toBe(false)
  })
})
