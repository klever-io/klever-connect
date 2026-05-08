/**
 * Example: unjail-validator (Flow 49)
 *
 * Unjails a validator that was previously jailed for missed blocks via
 * contractType 10 (`Unjail`). The request itself has no parameters — the chain
 * identifies the validator from the signing operator address.
 *
 * Wire shape (`UnjailRequest`)
 * ----------------------------
 * Empty interface. The intent is fully encoded in the contract type.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Operator: ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)
  console.log('Submitting empty Unjail request (contractType 10).')

  const builder = new TransactionBuilder(provider)
  // The unjail() builder method takes no parameters — the empty {} is the
  // canonical UnjailRequest.
  builder.sender(wallet.address).unjail({})
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Unjail tx hash: ${hash}`)
  console.log(`Explorer:       ${provider.getTransactionUrl(hash)}`)
  console.log(
    'On a real network, the validator returns to the active set after the next epoch transition.',
  )
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('unjail-validator failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
