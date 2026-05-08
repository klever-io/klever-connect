import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY)('kda-create-nft-collection (testnet)', () => {
  it('broadcasts CreateAsset for an NFT collection', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, KEY)
    await wallet.connect()
    try {
      const ticker = `NFT${Math.floor(Math.random() * 9999)}`
      const result = await wallet.sendTransaction({
        contractType: 1,
        type: 1,
        name: 'TestnetNFTCol',
        ticker,
        ownerAddress: wallet.address,
        precision: 0,
        maxSupply: 1000n,
        properties: { canMint: true, canBurn: true },
      })
      expect(typeof result.hash).toBe('string')
      expect(result.hash.length).toBeGreaterThan(0)
    } finally {
      await wallet.disconnect(true)
    }
  }, 90_000)
})
