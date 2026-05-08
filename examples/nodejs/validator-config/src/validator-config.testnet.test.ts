import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type ValidatorConfigRequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['BLS_PUBLIC_KEY'])

describe.skipIf(!SHOULD_RUN)('validator-config (testnet)', () => {
  it('builds a partial-update transaction', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: ValidatorConfigRequest = {
      blsPublicKey: process.env['BLS_PUBLIC_KEY']!,
      commission: 600,
    }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).validatorConfig(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
