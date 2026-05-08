import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''
const NFT = process.env['KLV_NFT_ID'] ?? ''
const RECIPIENT = process.env['KLV_RECIPIENT'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY || !NFT || !RECIPIENT)(
  'send-nft-transfer-with-royalties (testnet)',
  () => {
    it('broadcasts the NFT transfer and gets a hash', async () => {
      const provider = new KleverProvider({ network: 'testnet' })
      const wallet = new NodeWallet(provider, KEY)
      await wallet.connect()
      try {
        const result = await wallet.transfer({
          receiver: RECIPIENT,
          amount: 1n,
          kda: NFT,
        })
        expect(typeof result.hash).toBe('string')
        expect(result.hash.length).toBeGreaterThan(0)
      } finally {
        await wallet.disconnect(true)
      }
    }, 60_000)
  },
)
