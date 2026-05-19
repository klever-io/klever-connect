/**
 * Live test for flow #7 — purely cryptographic, but kept here to give the
 * `npm run test:testnet` script something to do per repo convention.
 */
import { describe, it, expect } from 'vitest'
import { KleverProvider, WalletFactory } from '@klever/connect'
import { generateMnemonicPhrase } from '@klever/connect-crypto'

describe('hd-wallet-from-mnemonic (live)', () => {
  it('a freshly derived wallet has a queryable balance (zero on a new account)', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const factory = new WalletFactory(provider)

    const mnemonic = generateMnemonicPhrase({ strength: 128 })
    const wallet = await factory.fromMnemonic(mnemonic)

    await wallet.connect()
    try {
      const balance = await wallet.getBalance()
      expect(typeof balance).toBe('bigint')
      // Could be > 0 if the testnet faucet pre-funded this random address
      // (vanishingly unlikely), so we only check shape.
      expect(balance >= 0n).toBe(true)
    } finally {
      await wallet.disconnect(true)
    }
  }, 30_000)
})
