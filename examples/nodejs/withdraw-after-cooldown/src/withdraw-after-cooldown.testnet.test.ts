import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY)('withdraw-after-cooldown (testnet)', () => {
  it('broadcasts a withdraw of type 0 (will fail if cooldown not elapsed)', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, KEY)
    await wallet.connect()
    try {
      const result = await wallet.sendTransaction({
        contractType: 8,
        kda: 'KLV',
        withdrawType: 0,
      })
      expect(typeof result.hash).toBe('string')
    } finally {
      await wallet.disconnect(true)
    }
  }, 60_000)
})
