import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type VoteRequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['PROPOSAL_ID'])

describe.skipIf(!SHOULD_RUN)('governance-vote (testnet)', () => {
  it('builds a YES vote tx', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: VoteRequest = {
      type: 0,
      proposalId: Number(process.env['PROPOSAL_ID']!),
    }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).vote(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
