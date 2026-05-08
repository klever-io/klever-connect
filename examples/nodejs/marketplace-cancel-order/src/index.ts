/**
 * Example: marketplace-cancel-order (Flow 42)
 *
 * Stage 4 of the marketplace lifecycle: cancel an unfilled marketplace order
 * via contractType 19 (`CancelMarketOrder`). Only the seller who created the
 * order can cancel it; the chain enforces this in consensus.
 *
 * Wire shape (`CancelMarketOrderRequest`)
 * ---------------------------------------
 * Just the `orderId`. The marketplace id and asset id are looked up by the
 * chain from the order itself.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type CancelMarketOrderRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const ORDER_ID = process.env['ORDER_ID']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!ORDER_ID) {
  console.error('Error: ORDER_ID is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  const request: CancelMarketOrderRequest = { orderId: ORDER_ID as string }
  console.log(`Seller:   ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)
  console.log(`OrderId:  ${ORDER_ID}`)

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).cancelMarketOrder(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Cancel tx hash: ${hash}`)
  console.log(`Explorer:       ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('marketplace-cancel-order failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
