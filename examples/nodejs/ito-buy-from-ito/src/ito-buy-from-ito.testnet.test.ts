import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type BuyRequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['KDA_ID'])

describe.skipIf(!SHOULD_RUN)('ito-buy-from-ito (testnet)', () => {
  it('builds a Buy(buyType=1) tx', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: BuyRequest = {
      buyType: 1,
      id: process.env['KDA_ID']!,
      amount: '1',
      currencyAmount: '1000000',
    }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).buy(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
