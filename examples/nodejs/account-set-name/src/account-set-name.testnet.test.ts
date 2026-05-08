import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type SetAccountNameRequest,
} from '@klever/connect'

const SHOULD_RUN = Boolean(process.env['PRIVATE_KEY'])

describe.skipIf(!SHOULD_RUN)('account-set-name (testnet)', () => {
  it('builds a SetAccountName tx', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request: SetAccountNameRequest = { name: 'testname' }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).setAccountName(request)
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
