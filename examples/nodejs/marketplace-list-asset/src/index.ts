/**
 * Example: marketplace-list-asset (Flow 40, Node side)
 *
 * Stage 2 of the marketplace lifecycle: list an asset for sale on an existing
 * marketplace via contractType 18 (`Sell`). Two listing models are supported:
 *
 *   - BuyItNow (marketType=0): single price, fills as soon as a buyer matches.
 *   - Auction (marketType=1): starting price + reserve + endTime; highest bid
 *      wins after `endTime`.
 *
 * Wire shape (`SellRequest`)
 * --------------------------
 * - `marketType`: 0 (BuyItNow) or 1 (Auction).
 * - `marketplaceId`: id from `marketplace-create` (flow 39).
 * - `assetId`: KDA / NFT id being sold.
 * - `currencyId`: optional payment currency. Defaults to KLV when omitted.
 * - `price`: raw smallest-unit price. For auctions this is the starting bid.
 * - `reservePrice`: auction-only minimum acceptable bid.
 * - `endTime`: auction-only seconds-since-epoch deadline.
 *
 * Auction validation is enforced client-side here so the user gets a fast,
 * informative error instead of a confusing chain reject.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type SellRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const MARKETPLACE_ID = process.env['MARKETPLACE_ID']
const ASSET_ID = process.env['ASSET_ID']
const MARKET_TYPE_RAW = process.env['MARKET_TYPE'] ?? '0'
const CURRENCY_ID = process.env['CURRENCY_ID']
const PRICE = process.env['PRICE']
const RESERVE_PRICE = process.env['RESERVE_PRICE']
const END_TIME = process.env['END_TIME']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

function fail(msg: string): never {
  console.error(`Error: ${msg}`)
  process.exit(1)
}

if (!PRIVATE_KEY) fail('PRIVATE_KEY is required.')
if (!MARKETPLACE_ID) fail('MARKETPLACE_ID is required (from flow 39).')
if (!ASSET_ID) fail('ASSET_ID is required.')
if (!PRICE) fail('PRICE is required (raw smallest units).')

async function main(): Promise<void> {
  const marketType = Number(MARKET_TYPE_RAW)
  if (marketType !== 0 && marketType !== 1) {
    throw new Error(`MARKET_TYPE must be 0 (BuyItNow) or 1 (Auction); got ${MARKET_TYPE_RAW}.`)
  }
  if (marketType === 1) {
    if (!END_TIME) {
      throw new Error('END_TIME is required for auctions (MARKET_TYPE=1).')
    }
  }

  const request: SellRequest = {
    marketType,
    marketplaceId: MARKETPLACE_ID as string,
    assetId: ASSET_ID as string,
    price: PRICE as string,
  }
  if (CURRENCY_ID && CURRENCY_ID.length > 0) request.currencyId = CURRENCY_ID
  if (marketType === 1) {
    request.endTime = END_TIME as string
    if (RESERVE_PRICE && RESERVE_PRICE.length > 0) request.reservePrice = RESERVE_PRICE
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()

  console.log(`Seller:        ${wallet.address}`)
  console.log(`Network:       ${NETWORK}`)
  console.log(`MarketplaceId: ${MARKETPLACE_ID}`)
  console.log(`Listing type:  ${marketType === 0 ? 'BuyItNow' : 'Auction'}`)
  console.log('Sell request:')
  console.log(JSON.stringify(request, null, 2))

  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).sell(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }
  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Listing tx hash: ${hash}`)
  console.log(`Explorer:        ${provider.getTransactionUrl(hash)}`)
  console.log(
    'After mining, the receipt will reveal the orderId — needed to cancel (flow 42) or buy (flow 41).',
  )
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('marketplace-list-asset failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
