import { describe, it, expect } from 'vitest'
import {
  generateMnemonicPhrase,
  isValidMnemonic,
  mnemonicToPrivateKey,
  deriveMultipleKeys,
  buildDerivationPath,
  DEFAULT_DERIVATION_PATH,
  KLEVER_COIN_TYPE,
} from '../hd-wallet'

describe('hd-wallet', () => {
  describe('generateMnemonicPhrase', () => {
    it('should generate a 12-word mnemonic by default (128 bits)', () => {
      const mnemonic = generateMnemonicPhrase()
      const words = mnemonic.split(' ')

      expect(words.length).toBe(12)
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should generate a 15-word mnemonic (160 bits)', () => {
      const mnemonic = generateMnemonicPhrase({ strength: 160 })
      const words = mnemonic.split(' ')

      expect(words.length).toBe(15)
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should generate a 18-word mnemonic (192 bits)', () => {
      const mnemonic = generateMnemonicPhrase({ strength: 192 })
      const words = mnemonic.split(' ')

      expect(words.length).toBe(18)
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should generate a 21-word mnemonic (224 bits)', () => {
      const mnemonic = generateMnemonicPhrase({ strength: 224 })
      const words = mnemonic.split(' ')

      expect(words.length).toBe(21)
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should generate a 24-word mnemonic (256 bits)', () => {
      const mnemonic = generateMnemonicPhrase({ strength: 256 })
      const words = mnemonic.split(' ')

      expect(words.length).toBe(24)
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should generate different mnemonics each time', () => {
      const mnemonic1 = generateMnemonicPhrase()
      const mnemonic2 = generateMnemonicPhrase()

      expect(mnemonic1).not.toBe(mnemonic2)
    })

    it('should throw error for invalid strength', () => {
      expect(() => generateMnemonicPhrase({ strength: 100 as any })).toThrow(
        'Invalid strength. Must be 128, 160, 192, 224, or 256',
      )
    })
  })

  describe('isValidMnemonic', () => {
    it('should return true for valid mnemonic', () => {
      const mnemonic = generateMnemonicPhrase()
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should return false for invalid mnemonic', () => {
      expect(isValidMnemonic('invalid mnemonic phrase test')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidMnemonic('')).toBe(false)
    })

    it('should return false for mnemonic with wrong checksum', () => {
      const validMnemonic = generateMnemonicPhrase()
      const words = validMnemonic.split(' ')
      words[words.length - 1] = 'abandon'
      const invalidMnemonic = words.join(' ')

      expect(isValidMnemonic(invalidMnemonic)).toBe(false)
    })
  })

  describe('mnemonicToPrivateKey', () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

    it('should derive private key from mnemonic with default path', () => {
      const privateKey = mnemonicToPrivateKey(testMnemonic)

      expect(privateKey).toBeDefined()
      expect(privateKey.bytes.length).toBe(32)
    })

    it('should derive private key with custom path', () => {
      const privateKey1 = mnemonicToPrivateKey(testMnemonic, {
        path: "m/44'/1'/0'/0/0",
      })
      const privateKey2 = mnemonicToPrivateKey(testMnemonic, {
        path: "m/44'/1'/0'/0/1",
      })

      expect(privateKey1.toHex()).not.toBe(privateKey2.toHex())
    })

    it('should derive private key with passphrase', () => {
      const privateKey1 = mnemonicToPrivateKey(testMnemonic)
      const privateKey2 = mnemonicToPrivateKey(testMnemonic, {
        passphrase: 'my-passphrase',
      })

      expect(privateKey1.toHex()).not.toBe(privateKey2.toHex())
    })

    it('should be deterministic for same mnemonic and path', () => {
      const privateKey1 = mnemonicToPrivateKey(testMnemonic)
      const privateKey2 = mnemonicToPrivateKey(testMnemonic)

      expect(privateKey1.toHex()).toBe(privateKey2.toHex())
    })

    it('should throw error for invalid mnemonic', () => {
      expect(() => mnemonicToPrivateKey('invalid mnemonic')).toThrow('Invalid mnemonic phrase')
    })
  })

  describe('deriveMultipleKeys', () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

    it('should derive multiple keys', () => {
      const keys = deriveMultipleKeys(testMnemonic, 5)

      expect(keys.length).toBe(5)
      expect(new Set(keys.map((k) => k.toHex())).size).toBe(5) // All unique
    })

    it('should derive keys sequentially from index', () => {
      const keys = deriveMultipleKeys(testMnemonic, 3, {
        path: "m/44'/1'/0'/0/0",
      })

      const key0 = mnemonicToPrivateKey(testMnemonic, { path: "m/44'/1'/0'/0/0" })
      const key1 = mnemonicToPrivateKey(testMnemonic, { path: "m/44'/1'/0'/0/1" })
      const key2 = mnemonicToPrivateKey(testMnemonic, { path: "m/44'/1'/0'/0/2" })

      expect(keys[0].toHex()).toBe(key0.toHex())
      expect(keys[1].toHex()).toBe(key1.toHex())
      expect(keys[2].toHex()).toBe(key2.toHex())
    })

    it('should derive keys starting from custom index', () => {
      const keys = deriveMultipleKeys(testMnemonic, 2, {
        path: "m/44'/1'/0'/0/5",
      })

      const key5 = mnemonicToPrivateKey(testMnemonic, { path: "m/44'/1'/0'/0/5" })
      const key6 = mnemonicToPrivateKey(testMnemonic, { path: "m/44'/1'/0'/0/6" })

      expect(keys[0].toHex()).toBe(key5.toHex())
      expect(keys[1].toHex()).toBe(key6.toHex())
    })

    it('should derive keys with passphrase', () => {
      const keys1 = deriveMultipleKeys(testMnemonic, 2)
      const keys2 = deriveMultipleKeys(testMnemonic, 2, { passphrase: 'test' })

      expect(keys1[0].toHex()).not.toBe(keys2[0].toHex())
      expect(keys1[1].toHex()).not.toBe(keys2[1].toHex())
    })

    it('should throw error for count less than 1', () => {
      expect(() => deriveMultipleKeys(testMnemonic, 0)).toThrow('Count must be at least 1')
      expect(() => deriveMultipleKeys(testMnemonic, -1)).toThrow('Count must be at least 1')
    })
  })

  describe('buildDerivationPath', () => {
    it('should build default path (0/0/0)', () => {
      const path = buildDerivationPath()

      expect(path).toBe(`m/44'/${KLEVER_COIN_TYPE}'/0'/0/0`)
    })

    it('should build path with custom account', () => {
      const path = buildDerivationPath(5)

      expect(path).toBe(`m/44'/${KLEVER_COIN_TYPE}'/5'/0/0`)
    })

    it('should build path with custom account and change', () => {
      const path = buildDerivationPath(2, 1)

      expect(path).toBe(`m/44'/${KLEVER_COIN_TYPE}'/2'/1/0`)
    })

    it('should build path with custom account, change, and index', () => {
      const path = buildDerivationPath(3, 0, 10)

      expect(path).toBe(`m/44'/${KLEVER_COIN_TYPE}'/3'/0/10`)
    })

    it('should use KLEVER_COIN_TYPE constant', () => {
      const path = buildDerivationPath(0, 0, 0)

      expect(path).toContain(`44'/${KLEVER_COIN_TYPE}'`)
    })

    it('should throw error for negative account', () => {
      expect(() => buildDerivationPath(-1)).toThrow('Account must be a non-negative integer')
    })

    it('should throw error for non-integer account', () => {
      expect(() => buildDerivationPath(1.5)).toThrow('Account must be a non-negative integer')
    })

    it('should throw error for invalid change value', () => {
      expect(() => buildDerivationPath(0, -1)).toThrow(
        'Change must be 0 (external) or 1 (internal)',
      )
      expect(() => buildDerivationPath(0, 2)).toThrow('Change must be 0 (external) or 1 (internal)')
      expect(() => buildDerivationPath(0, 0.5)).toThrow(
        'Change must be 0 (external) or 1 (internal)',
      )
    })

    it('should throw error for negative index', () => {
      expect(() => buildDerivationPath(0, 0, -1)).toThrow('Index must be a non-negative integer')
    })

    it('should throw error for non-integer index', () => {
      expect(() => buildDerivationPath(0, 0, 1.5)).toThrow('Index must be a non-negative integer')
    })
  })

  describe('DEFAULT_DERIVATION_PATH', () => {
    it('should be a valid BIP44 path', () => {
      expect(DEFAULT_DERIVATION_PATH).toBe("m/44'/1'/0'/0/0")
    })
  })

  describe('KLEVER_COIN_TYPE', () => {
    it('should be 1', () => {
      expect(KLEVER_COIN_TYPE).toBe(1)
    })
  })
})
