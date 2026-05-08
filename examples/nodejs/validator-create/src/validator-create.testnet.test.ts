/**
 * Live testnet variant for validator-create.
 *
 * EXCLUDED from CI — `*.testnet.test.ts` files are gated by the project's
 * vitest workspace configuration. Run manually:
 *
 *   pnpm --filter @klever/example-nodejs-validator-create run test:testnet
 *
 * This test EXPECTS to fail at chain-level unless the BLS key has been
 * registered through the proper channel for the chosen network. We therefore
 * only assert that:
 *   - The wallet connects.
 *   - The provider reports the operator's account.
 *   - The transaction is built + signed without throwing.
 * Actual broadcast is gated by DRY_RUN and is not asserted here.
 */
import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type CreateValidatorRequest,
} from '@klever/connect'

const SHOULD_RUN =
  Boolean(process.env['PRIVATE_KEY']) && Boolean(process.env['BLS_PUBLIC_KEY'])

describe.skipIf(!SHOULD_RUN)('validator-create (testnet)', () => {
  it('builds and signs a CreateValidator transaction against testnet', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, process.env['PRIVATE_KEY']!)
    await wallet.connect()

    const request: CreateValidatorRequest = {
      blsPublicKey: process.env['BLS_PUBLIC_KEY']!,
      ownerAddress: wallet.address,
      rewardAddress: wallet.address,
      canDelegate: true,
      commission: 500,
    }
    const builder = new TransactionBuilder(provider)
    builder.sender(wallet.address).createValidator(request)
    const unsigned = await builder.build()
    const signed = await wallet.signTransaction(unsigned)

    expect(signed.toHex().length).toBeGreaterThan(0)
    await wallet.disconnect(true)
  }, 30_000)
})
