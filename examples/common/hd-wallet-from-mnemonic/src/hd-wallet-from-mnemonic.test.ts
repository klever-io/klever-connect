import { describe, it, expect } from 'vitest'
import { KleverProvider, WalletFactory } from '@klever/connect'
import {
  generateMnemonicPhrase,
  isValidMnemonic,
  DEFAULT_DERIVATION_PATH,
} from '@klever/connect-crypto'

const KNOWN_MNEMONIC =
  // BIP39 spec test vector — fully public, never use this on a real account.
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('hd-wallet-from-mnemonic', () => {
  it('generateMnemonicPhrase produces 12 words by default', () => {
    const m = generateMnemonicPhrase({ strength: 128 })
    expect(m.split(' ')).toHaveLength(12)
    expect(isValidMnemonic(m)).toBe(true)
  })

  it('generateMnemonicPhrase produces 24 words at strength 256', () => {
    const m = generateMnemonicPhrase({ strength: 256 })
    expect(m.split(' ')).toHaveLength(24)
    expect(isValidMnemonic(m)).toBe(true)
  })

  it('isValidMnemonic rejects garbage', () => {
    expect(isValidMnemonic('these are not valid bip39 words at all')).toBe(false)
  })

  it('the same mnemonic + path always derives the same address', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const factory = new WalletFactory(provider)

    const a = await factory.fromMnemonic(KNOWN_MNEMONIC, undefined, { path: DEFAULT_DERIVATION_PATH })
    const b = await factory.fromMnemonic(KNOWN_MNEMONIC, undefined, { path: DEFAULT_DERIVATION_PATH })

    await a.connect()
    await b.connect()
    try {
      expect(a.address).toBe(b.address)
      expect(a.publicKey).toBe(b.publicKey)
    } finally {
      await a.disconnect(true)
      await b.disconnect(true)
    }
  })

  it('different paths produce different addresses', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const factory = new WalletFactory(provider)

    const a = await factory.fromMnemonic(KNOWN_MNEMONIC, undefined, { path: "m/44'/690'/0'/0'/0'" })
    const b = await factory.fromMnemonic(KNOWN_MNEMONIC, undefined, { path: "m/44'/690'/0'/0'/1'" })

    await a.connect()
    await b.connect()
    try {
      expect(a.address).not.toBe(b.address)
    } finally {
      await a.disconnect(true)
      await b.disconnect(true)
    }
  })
})
