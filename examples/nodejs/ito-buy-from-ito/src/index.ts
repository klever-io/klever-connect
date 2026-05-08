/**
 * Example: ito-buy-from-ito (Flow 45, Node side)
 *
 * Stage 3 of the ITO lifecycle: buy tokens from an ITO. Uses contractType 17
 * (`Buy`) but with `buyType=1` (ITO path). The marketplace path uses
 * `buyType=0` and is covered by flow 41 (`marketplace-buy-listing`).
 *
 * Wire shape (`BuyRequest` for ITO)
 * ---------------------------------
 * - `buyType`: 1 = ITO.
 * - `id`: KDA asset id (NOT an order id).
 * - `currencyId`: currency the buyer pays in (must be configured in packInfo).
 * - `amount`: quantity of tokens to buy in raw smallest units.
 * - `currencyAmount`: total currency the buyer commits — should equal
 *    pack.price × amount according to the ITO's pack tier.
 *
 * Why a separate example
 * ----------------------
 * The ITO and marketplace flows share contractType 17 but have different
 * semantics, lookup rules, and "what id field means". A learner inspecting
 * the file should never have to mentally swap between the two paths — they get
 * a dedicated example each.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type BuyRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const KDA_ID = process.env['KDA_ID']
const CURRENCY_ID = process.env['CURRENCY_ID']
const AMOUNT = process.env['AMOUNT']
const CURRENCY_AMOUNT = process.env['CURRENCY_AMOUNT']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID) {
  console.error('Error: KDA_ID is required.')
  process.exit(1)
}
if (!AMOUNT) {
  console.error('Error: AMOUNT is required.')
  process.exit(1)
}
if (!CURRENCY_AMOUNT) {
  console.error('Error: CURRENCY_AMOUNT is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const request: BuyRequest = {
    buyType: 1, // ITO path
    id: KDA_ID as string,
    amount: AMOUNT as string,
    currencyAmount: CURRENCY_AMOUNT as string,
  }
  if (CURRENCY_ID && CURRENCY_ID.length > 0) request.currencyId = CURRENCY_ID

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Buyer:   ${wallet.address}`)
  console.log(`Network: ${NETWORK}`)
  console.log('Buy (ITO) request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).buy(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`ITO buy tx hash: ${hash}`)
  console.log(`Explorer:        ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('ito-buy-from-ito failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
