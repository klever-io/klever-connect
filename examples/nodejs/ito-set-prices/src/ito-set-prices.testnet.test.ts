import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type SetITOPricesRequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['KDA_ID'])

describe.skipIf(!SHOULD_RUN)('ito-set-prices (testnet)', () => {
  it('builds a SetITOPrices tx', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: SetITOPricesRequest = {
      kda: process.env['KDA_ID']!,
      packInfo: { KLV: { packs: [{ amount: '1', price: '1000000' }] } },
    }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).setITOPrices(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
