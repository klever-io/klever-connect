import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type ConfigITORequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['KDA_ID'])

describe.skipIf(!SHOULD_RUN)('ito-configure (testnet)', () => {
  it('builds a ConfigITO tx', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: ConfigITORequest = { kda: process.env['KDA_ID']!, status: 1 }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).configITO(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
