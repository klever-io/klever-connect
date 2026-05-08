import { describe, it, expect } from 'vitest'
import { KleverProvider, type KleverAddress } from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['ADDRESSES'])

describe.skipIf(!SHOULD_RUN)('balance-alert-watcher (testnet)', () => {
  it('reads a real balance', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const addr = process.env['ADDRESSES']!.split(',')[0]!.trim() as KleverAddress
    const bal = await provider.getBalance(addr, 'KLV')
    expect(bal).toBeDefined()
  }, 30_000)
})
