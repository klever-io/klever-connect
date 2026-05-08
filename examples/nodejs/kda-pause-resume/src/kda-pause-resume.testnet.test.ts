import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''
const KDA = process.env['KLV_KDA_ID'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY || !KDA)('kda-pause-resume (testnet)', () => {
  it('pauses then resumes the asset', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, KEY)
    await wallet.connect()
    try {
      const pause = await wallet.sendTransaction({
        contractType: 11,
        triggerType: 3,
        assetId: KDA,
      })
      expect(typeof pause.hash).toBe('string')
      if (pause.wait) await pause.wait()

      const resume = await wallet.sendTransaction({
        contractType: 11,
        triggerType: 4,
        assetId: KDA,
      })
      expect(typeof resume.hash).toBe('string')
    } finally {
      await wallet.disconnect(true)
    }
  }, 90_000)
})
