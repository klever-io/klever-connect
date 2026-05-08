import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type SellRequest,
} from '@klever/connect'

const SHOULD_RUN =
  Boolean(process.env['PRIVATE_KEY']) &&
  Boolean(process.env['MARKETPLACE_ID']) &&
  Boolean(process.env['ASSET_ID'])

describe.skipIf(!SHOULD_RUN)('marketplace-list-asset (testnet)', () => {
  it('builds a Sell tx', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: SellRequest = {
      marketType: 0,
      marketplaceId: process.env['MARKETPLACE_ID']!,
      assetId: process.env['ASSET_ID']!,
      price: '1000000',
    }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).sell(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
