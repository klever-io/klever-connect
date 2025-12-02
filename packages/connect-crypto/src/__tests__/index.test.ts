import { describe, it, expect } from 'vitest'
import * as cryptoModule from '../index'

describe('@klever/connect-crypto exports', () => {
  describe('Types', () => {
    it('should export PrivateKey type', () => {
      expect(cryptoModule).toHaveProperty('PrivateKeyImpl')
    })

    it('should export PublicKey type', () => {
      expect(cryptoModule).toHaveProperty('PublicKeyImpl')
    })

    it('should export Signature type', () => {
      expect(cryptoModule).toHaveProperty('SignatureImpl')
    })
  })

  describe('HD Wallet Functions', () => {
    it('should export generateMnemonicPhrase', () => {
      expect(cryptoModule).toHaveProperty('generateMnemonicPhrase')
      expect(typeof cryptoModule.generateMnemonicPhrase).toBe('function')
    })

    it('should export isValidMnemonic', () => {
      expect(cryptoModule).toHaveProperty('isValidMnemonic')
      expect(typeof cryptoModule.isValidMnemonic).toBe('function')
    })

    it('should export mnemonicToPrivateKey', () => {
      expect(cryptoModule).toHaveProperty('mnemonicToPrivateKey')
      expect(typeof cryptoModule.mnemonicToPrivateKey).toBe('function')
    })

    it('should export deriveMultipleKeys', () => {
      expect(cryptoModule).toHaveProperty('deriveMultipleKeys')
      expect(typeof cryptoModule.deriveMultipleKeys).toBe('function')
    })

    it('should export buildDerivationPath', () => {
      expect(cryptoModule).toHaveProperty('buildDerivationPath')
      expect(typeof cryptoModule.buildDerivationPath).toBe('function')
    })

    it('should export DEFAULT_DERIVATION_PATH', () => {
      expect(cryptoModule).toHaveProperty('DEFAULT_DERIVATION_PATH')
      expect(cryptoModule.DEFAULT_DERIVATION_PATH).toBe("m/44'/690'/0'/0/0")
    })

    it('should export KLEVER_COIN_TYPE', () => {
      expect(cryptoModule).toHaveProperty('KLEVER_COIN_TYPE')
      expect(cryptoModule.KLEVER_COIN_TYPE).toBe(690)
    })
  })

  describe('Keystore Functions', () => {
    it('should export encryptToKeystore', () => {
      expect(cryptoModule).toHaveProperty('encryptToKeystore')
      expect(typeof cryptoModule.encryptToKeystore).toBe('function')
    })

    it('should export decryptKeystore', () => {
      expect(cryptoModule).toHaveProperty('decryptKeystore')
      expect(typeof cryptoModule.decryptKeystore).toBe('function')
    })

    it('should export isPasswordCorrect', () => {
      expect(cryptoModule).toHaveProperty('isPasswordCorrect')
      expect(typeof cryptoModule.isPasswordCorrect).toBe('function')
    })

    it('should export DEFAULT_SCRYPT_PARAMS', () => {
      expect(cryptoModule).toHaveProperty('DEFAULT_SCRYPT_PARAMS')
      expect(cryptoModule.DEFAULT_SCRYPT_PARAMS).toHaveProperty('n')
      expect(cryptoModule.DEFAULT_SCRYPT_PARAMS).toHaveProperty('r')
      expect(cryptoModule.DEFAULT_SCRYPT_PARAMS).toHaveProperty('p')
      expect(cryptoModule.DEFAULT_SCRYPT_PARAMS).toHaveProperty('dklen')
    })
  })

  describe('Crypto Provider', () => {
    it('should export cryptoProvider', () => {
      expect(cryptoModule).toHaveProperty('cryptoProvider')
      expect(typeof cryptoModule.cryptoProvider).toBe('object')
    })

    it('should export crypto alias for cryptoProvider', () => {
      expect(cryptoModule).toHaveProperty('crypto')
      expect(cryptoModule.crypto).toBe(cryptoModule.cryptoProvider)
    })

    it('cryptoProvider should have generateKeyPair method', () => {
      expect(cryptoModule.cryptoProvider).toHaveProperty('generateKeyPair')
      expect(typeof cryptoModule.cryptoProvider.generateKeyPair).toBe('function')
    })

    it('cryptoProvider should have getPublicKey method', () => {
      expect(cryptoModule.cryptoProvider).toHaveProperty('getPublicKey')
      expect(typeof cryptoModule.cryptoProvider.getPublicKey).toBe('function')
    })

    it('cryptoProvider should have signMessage method', () => {
      expect(cryptoModule.cryptoProvider).toHaveProperty('signMessage')
      expect(typeof cryptoModule.cryptoProvider.signMessage).toBe('function')
    })

    it('cryptoProvider should have verifySignature method', () => {
      expect(cryptoModule.cryptoProvider).toHaveProperty('verifySignature')
      expect(typeof cryptoModule.cryptoProvider.verifySignature).toBe('function')
    })

    it('cryptoProvider should have importPrivateKey method', () => {
      expect(cryptoModule.cryptoProvider).toHaveProperty('importPrivateKey')
      expect(typeof cryptoModule.cryptoProvider.importPrivateKey).toBe('function')
    })
  })

  describe('PEM Functions', () => {
    it('should export loadPrivateKeyFromPem', () => {
      expect(cryptoModule).toHaveProperty('loadPrivateKeyFromPem')
      expect(typeof cryptoModule.loadPrivateKeyFromPem).toBe('function')
    })

    it('should export isEncryptedPemBlock', () => {
      expect(cryptoModule).toHaveProperty('isEncryptedPemBlock')
      expect(typeof cryptoModule.isEncryptedPemBlock).toBe('function')
    })
  })

  describe('Signing Functions', () => {
    it('should export generateKeyPair', () => {
      expect(cryptoModule).toHaveProperty('generateKeyPair')
      expect(typeof cryptoModule.generateKeyPair).toBe('function')
    })

    it('should export verifySignature', () => {
      expect(cryptoModule).toHaveProperty('verifySignature')
      expect(typeof cryptoModule.verifySignature).toBe('function')
    })
  })

  describe('Integration test - Generate and use mnemonic', () => {
    it('should generate mnemonic and derive private key', () => {
      const mnemonic = cryptoModule.generateMnemonicPhrase()
      expect(cryptoModule.isValidMnemonic(mnemonic)).toBe(true)

      const privateKey = cryptoModule.mnemonicToPrivateKey(mnemonic)
      expect(privateKey.bytes.length).toBe(32)
    })
  })

  describe('Integration test - Keystore roundtrip', () => {
    it('should encrypt and decrypt private key', async () => {
      const { privateKey } = await cryptoModule.generateKeyPair()
      const password = 'test-password'
      const address = 'klv1test'

      const keystore = await cryptoModule.encryptToKeystore(privateKey, password, address, {
        scryptN: 4096,
      })
      expect(keystore.version).toBe(3)

      const decrypted = await cryptoModule.decryptKeystore(keystore, password)
      expect(decrypted.toHex()).toBe(privateKey.toHex())

      const isCorrect = await cryptoModule.isPasswordCorrect(keystore, password)
      expect(isCorrect).toBe(true)
    }, 10000)
  })
})
