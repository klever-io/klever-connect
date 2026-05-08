import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''
const BUCKET = process.env['KLV_BUCKET_ID'] ?? ''
const VALIDATOR = process.env['KLV_VALIDATOR'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY || !BUCKET || !VALIDATOR)(
  'delegate-to-validator (testnet)',
  () => {
    it('broadcasts the delegation tx', async () => {
      const provider = new KleverProvider({ network: 'testnet' })
      const wallet = new NodeWallet(provider, KEY)
      await wallet.connect()
      try {
        const result = await wallet.sendTransaction({
          contractType: 6,
          receiver: VALIDATOR,
          bucketId: BUCKET,
        })
        expect(typeof result.hash).toBe('string')
        expect(result.hash.length).toBeGreaterThan(0)
      } finally {
        await wallet.disconnect(true)
      }
    }, 60_000)
  },
)
