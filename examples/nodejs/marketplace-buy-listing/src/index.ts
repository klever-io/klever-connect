/**
 * Example: marketplace-buy-listing (Flow 41, Node side)
 *
 * Stage 3 of the marketplace lifecycle: buy / bid on an existing listing via
 * contractType 17 (`Buy`). The same `Buy` contract powers both marketplace
 * purchases and ITO purchases — they're discriminated by `buyType`:
 *
 *   buyType = 0 -> MARKET (this example)
 *   buyType = 1 -> ITO    (see flow 45 — `ito-buy-from-ito`)
 *
 * Wire shape (`BuyRequest`)
 * -------------------------
 * - `buyType`: 0 (market) or 1 (ITO).
 * - `id`: orderId for buyType=0, kda asset id for buyType=1.
 * - `currencyId`: optional — payment currency (defaults to listing's currency).
 * - `amount`: quantity to buy in raw smallest units (e.g. NFT count = 1).
 * - `currencyAmount`: total currency the buyer commits in raw smallest units.
 *
 * For BuyItNow listings, `currencyAmount` should equal the listing price. For
 * auctions, `currencyAmount` is the bid; the chain rejects bids below
 * `reservePrice` (or current high bid).
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
const BUY_TYPE_RAW = process.env['BUY_TYPE'] ?? '0'
const ORDER_ID = process.env['ORDER_ID']
const CURRENCY_ID = process.env['CURRENCY_ID']
const AMOUNT = process.env['AMOUNT']
const CURRENCY_AMOUNT = process.env['CURRENCY_AMOUNT']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!ORDER_ID) {
  console.error('Error: ORDER_ID is required for buyType=0 (market).')
  process.exit(1)
}

async function main(): Promise<void> {
  const buyType = Number(BUY_TYPE_RAW)
  if (buyType !== 0 && buyType !== 1) {
    throw new Error(`BUY_TYPE must be 0 (market) or 1 (ITO); got ${BUY_TYPE_RAW}.`)
  }
  if (buyType === 1) {
    console.warn(
      'WARNING: BUY_TYPE=1 is the ITO path. Prefer the dedicated `ito-buy-from-ito` example (flow 45).',
    )
  }

  const request: BuyRequest = {
    buyType,
    id: ORDER_ID as string,
  }
  if (CURRENCY_ID && CURRENCY_ID.length > 0) request.currencyId = CURRENCY_ID
  if (AMOUNT && AMOUNT.length > 0) request.amount = AMOUNT
  if (CURRENCY_AMOUNT && CURRENCY_AMOUNT.length > 0) request.currencyAmount = CURRENCY_AMOUNT

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Buyer:    ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)
  console.log('Buy request:')
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
  console.log(`Buy tx hash: ${hash}`)
  console.log(`Explorer:    ${provider.getTransactionUrl(hash)}`)
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('marketplace-buy-listing failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
