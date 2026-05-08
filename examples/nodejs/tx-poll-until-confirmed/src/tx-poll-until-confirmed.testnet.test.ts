import { describe, it, expect } from 'vitest'
import { KleverProvider, type TransactionHash } from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['TX_HASH'])

describe.skipIf(!SHOULD_RUN)('tx-poll-until-confirmed (testnet)', () => {
  it('waitForTransaction completes for an existing hash', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const tx = await provider.waitForTransaction(process.env['TX_HASH']! as TransactionHash)
    expect(tx).toBeTruthy()
  }, 60_000)
})
