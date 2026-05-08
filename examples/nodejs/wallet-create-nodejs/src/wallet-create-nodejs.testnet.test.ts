/**
 * Live testnet variant of wallet-create-nodejs.
 *
 * Asserts that the three construction paths produce a wallet whose derived address
 * is valid Klever bech32, by exercising the real Ed25519 + bech32 code paths.
 *
 * Skip mechanism: file ends in `.testnet.test.ts` (excluded from CI), and the
 * test body is gated on `RUN_TESTNET=1` so a stray local `vitest` is a no-op:
 *
 *     RUN_TESTNET=1 npm run test:testnet
 */

import { describe, expect, it } from 'vitest'

import {
  KleverProvider,
  NodeWallet,
  WalletFactory,
  isValidAddress,
} from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'

describe.skipIf(!RUN_TESTNET)('wallet-create-nodejs (testnet)', () => {
  it('NodeWallet.generate produces a valid bech32 address', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const w = await NodeWallet.generate(provider)
    await w.connect()
    expect(isValidAddress(w.address)).toBe(true)
    await w.disconnect(true)
  })

  it('WalletFactory.createRandom in Node.js returns a NodeWallet', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const factory = new WalletFactory(provider)
    const w = await factory.createRandom()
    await w.connect()
    expect(isValidAddress(w.address)).toBe(true)
    expect(w.constructor.name).toBe('NodeWallet')
    await w.disconnect(true)
  })
})
