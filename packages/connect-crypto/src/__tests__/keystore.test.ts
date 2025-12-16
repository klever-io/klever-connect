import { hexDecode } from '@klever/connect-encoding'
import { describe, expect, it } from 'vitest'
import { PrivateKeyImpl } from '../keys'
import { decryptKeystore, encryptToKeystore, isPasswordCorrect } from '../keystore'

describe('keystore', () => {
  const testPrivateKeyHex = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  const testPassword = 'test-password-123'
  const testAddress = 'klv1test123456789abcdef'

  describe('encryptToKeystore', () => {
    it('should create a valid keystore object', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)

      expect(keystore).toBeDefined()
      expect(keystore.version).toBe(1)
      expect(keystore.id).toBeDefined()
      expect(keystore.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      expect(keystore.address).toBe('test123456789abcdef')
      expect(keystore.crypto).toBeDefined()
      expect(keystore.crypto.cipher).toBe('aes-256-gcm')
      expect(keystore.crypto.kdf).toBe('scrypt')
    })

    it('should generate unique IDs for each keystore', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore1 = await encryptToKeystore(privateKey, testPassword, testAddress)
      const keystore2 = await encryptToKeystore(privateKey, testPassword, testAddress)

      expect(keystore1.id).not.toBe(keystore2.id)
    })

    it('should use custom scrypt parameters', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress, {
        scryptN: 4096,
        scryptR: 4,
        scryptP: 2,
      })

      expect(keystore.crypto.kdfparams.n).toBe(4096)
      expect(keystore.crypto.kdfparams.r).toBe(4)
      expect(keystore.crypto.kdfparams.p).toBe(2)
    })

    it('should throw error if scryptN is not power of 2', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))

      await expect(
        encryptToKeystore(privateKey, testPassword, testAddress, {
          scryptN: 1000,
        }),
      ).rejects.toThrow('scryptN must be a power of 2')
    })

    it('should throw error if scryptR or scryptP is not positive', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))

      await expect(
        encryptToKeystore(privateKey, testPassword, testAddress, {
          scryptR: 0,
        }),
      ).rejects.toThrow('scryptR and scryptP must be positive')

      await expect(
        encryptToKeystore(privateKey, testPassword, testAddress, {
          scryptP: -1,
        }),
      ).rejects.toThrow('scryptR and scryptP must be positive')
    })

    it('should strip klv1 prefix from address', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, 'klv1address123')

      expect(keystore.address).toBe('address123')
    })
  })

  describe('decryptKeystore', () => {
    it('should decrypt keystore and return original private key', async () => {
      const originalPrivateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(originalPrivateKey, testPassword, testAddress)

      const decryptedPrivateKey = await decryptKeystore(keystore, testPassword)

      expect(decryptedPrivateKey.toHex()).toBe(testPrivateKeyHex)
    })

    it('should accept keystore as JSON string', async () => {
      const originalPrivateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(originalPrivateKey, testPassword, testAddress)
      const keystoreJson = JSON.stringify(keystore)

      const decryptedPrivateKey = await decryptKeystore(keystoreJson, testPassword)

      expect(decryptedPrivateKey.toHex()).toBe(testPrivateKeyHex)
    })

    it('should throw error with wrong password', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)

      await expect(decryptKeystore(keystore, 'wrong-password')).rejects.toThrow(
        'Invalid password or corrupted keystore',
      )
    })

    it('should throw error with unsupported version', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)
      // @ts-expect-error - Testing invalid version
      keystore.version = 2

      await expect(decryptKeystore(keystore, testPassword)).rejects.toThrow(
        'Unsupported keystore version: 2',
      )
    })

    it('should throw error with unsupported cipher', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)
      // @ts-expect-error - Testing invalid cipher
      keystore.crypto.cipher = 'aes-256-cbc'

      await expect(decryptKeystore(keystore, testPassword)).rejects.toThrow(
        'Unsupported cipher: aes-256-cbc',
      )
    })

    it('should throw error with unsupported KDF', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)
      // @ts-expect-error - Testing invalid KDF
      keystore.crypto.kdf = 'pbkdf2'

      await expect(decryptKeystore(keystore, testPassword)).rejects.toThrow(
        'Unsupported KDF: pbkdf2',
      )
    })
  })

  describe('isPasswordCorrect', () => {
    it('should return true for correct password', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)

      const isCorrect = await isPasswordCorrect(keystore, testPassword)

      expect(isCorrect).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)

      const isCorrect = await isPasswordCorrect(keystore, 'wrong-password')

      expect(isCorrect).toBe(false)
    })

    it('should accept keystore as JSON string', async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))
      const keystore = await encryptToKeystore(privateKey, testPassword, testAddress)
      const keystoreJson = JSON.stringify(keystore)

      const isCorrect = await isPasswordCorrect(keystoreJson, testPassword)

      expect(isCorrect).toBe(true)
    })

    it('should return false for invalid keystore JSON', async () => {
      const isCorrect = await isPasswordCorrect('invalid json', testPassword)

      expect(isCorrect).toBe(false)
    })
  })

  describe('roundtrip encryption/decryption', () => {
    it('should successfully encrypt and decrypt multiple times', { timeout: 10000 }, async () => {
      const privateKey = PrivateKeyImpl.fromBytes(hexDecode(testPrivateKeyHex))

      // Use faster scrypt params for testing
      const testOptions = {
        scryptN: 4096,
        scryptR: 4,
        scryptP: 1,
      }

      for (let i = 0; i < 3; i++) {
        const keystore = await encryptToKeystore(privateKey, testPassword, testAddress, testOptions)
        const decrypted = await decryptKeystore(keystore, testPassword)
        expect(decrypted.toHex()).toBe(testPrivateKeyHex)
      }
    })
  })
})
