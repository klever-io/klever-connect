import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''
const KDA = process.env['KLV_KDA_ID'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY || !KDA)('send-kda-transfer (testnet)', () => {
  it('self-sends 1 unit of KLV_KDA_ID and returns a hash', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, KEY)
    await wallet.connect()
    try {
      const result = await wallet.transfer({
        receiver: wallet.address,
        amount: 1n,
        kda: KDA,
      })
      expect(typeof result.hash).toBe('string')
      expect(result.hash.length).toBeGreaterThan(0)
    } finally {
      await wallet.disconnect(true)
    }
  }, 60_000)
})
