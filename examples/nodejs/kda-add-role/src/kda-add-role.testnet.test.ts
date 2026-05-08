import { describe, expect, it } from 'vitest'
import { KleverProvider, NodeWallet } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''
const KDA = process.env['KLV_KDA_ID'] ?? ''
const ADDR = process.env['KLV_ROLE_ADDRESS'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY || !KDA || !ADDR)('kda-add-role (testnet)', () => {
  it('grants mint role to KLV_ROLE_ADDRESS', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, KEY)
    await wallet.connect()
    try {
      const result = await wallet.sendTransaction({
        contractType: 11,
        triggerType: 6,
        assetId: KDA,
        role: { address: ADDR, hasRoleMint: true, hasRoleSetITOPrices: false },
      })
      expect(typeof result.hash).toBe('string')
      expect(result.hash.length).toBeGreaterThan(0)
    } finally {
      await wallet.disconnect(true)
    }
  }, 60_000)
})
