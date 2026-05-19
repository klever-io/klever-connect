import { describe, it, expect } from 'vitest'
import { KleverProvider, createKleverAddress } from '@klever/connect'

const SAMPLE = process.env['KLEVER_TESTNET_ADDRESS'] ??
  'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'

describe('account-info (live testnet)', () => {
  it('returns a structured account for a real address', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const addr = createKleverAddress(SAMPLE)
    const account = await provider.getAccount(addr)

    expect(account).toBeDefined()
    expect(typeof account.nonce).toBe('number')
    expect(account.assets).toBeDefined()
  }, 30_000)
})
