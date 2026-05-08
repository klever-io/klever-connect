import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type UpdateAccountPermissionRequest,
} from '@klever/connect'

const SHOULD_RUN =
  Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['PERMISSIONS_JSON'])

describe.skipIf(!SHOULD_RUN)('account-permissions-update (testnet)', () => {
  it('builds the request', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()
    const request = JSON.parse(process.env['PERMISSIONS_JSON']!) as
      UpdateAccountPermissionRequest['permissions']
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).updateAccountPermission({ permissions: request })
    const tx = await builder.build()
    const signed = await wallet.signTransaction(tx)
    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
