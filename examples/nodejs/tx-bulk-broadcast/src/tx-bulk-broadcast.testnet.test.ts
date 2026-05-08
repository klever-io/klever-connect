import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type KleverAddress,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['RECIPIENTS_JSON'])

describe.skipIf(!SHOULD_RUN)('tx-bulk-broadcast (testnet)', () => {
  it('builds N txs with incrementing nonces', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const recipients = JSON.parse(process.env['RECIPIENTS_JSON']!) as Array<{
      receiver: string
      amount: string
    }>
    const acct = await provider.getAccount(wallet.address as KleverAddress)
    const base = acct.nonce
    for (let i = 0; i < recipients.length; i++) {
      const builder = new TransactionBuilder(provider)
      builder
        .sender(wallet.address)
        .nonce(base + i)
        .transfer({ receiver: recipients[i]!.receiver, amount: recipients[i]!.amount })
      const tx = await builder.build()
      const signed = await wallet.signTransaction(tx)
      expect(signed.toHex().length).toBeGreaterThan(0)
    }
    await wallet.disconnect(true)
  }, 60_000)
})
