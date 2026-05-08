import { describe, it, expect } from 'vitest'
import { KleverProvider, createKleverAddress } from '@klever/connect'

const ADDR = process.env['KLEVER_TESTNET_ADDRESS']
const maybe = ADDR ? it : it.skip

describe('bucket-list-and-status (live testnet)', () => {
  maybe('returns an account with bucket / asset shape', async () => {
    if (!ADDR) throw new Error('KLEVER_TESTNET_ADDRESS not set')
    const provider = new KleverProvider({ network: 'testnet' })
    const acc = await provider.getAccount(createKleverAddress(ADDR))
    expect(acc.assets).toBeDefined()
  }, 30_000)
})
