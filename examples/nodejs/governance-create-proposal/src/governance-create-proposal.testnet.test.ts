import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type ProposalRequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY'])

describe.skipIf(!SHOULD_RUN)('governance-create-proposal (testnet)', () => {
  it('builds a proposal transaction', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: ProposalRequest = { parameters: { 22: '5000' } }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).proposal(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
