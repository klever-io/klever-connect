/**
 * Example: marketplace-create (Flow 39)
 *
 * Creates a new on-chain Klever marketplace via contractType 20
 * (`CreateMarketplace`). A "marketplace" on Klever is a logical container that
 * groups Sell/Buy/Cancel orders and (optionally) collects a referral fee on
 * each completed sale.
 *
 * Marketplace flow lifecycle (this example library)
 * -------------------------------------------------
 *   Stage 1 — `marketplace-create`         (this example)  contractType 20
 *   Stage 2 — `marketplace-list-asset`     (flow 40)         contractType 18 (Sell)
 *   Stage 3 — `marketplace-buy-listing`    (flow 41)         contractType 17 (Buy)
 *   Stage 4 — `marketplace-cancel-order`   (flow 42)         contractType 19
 *
 * Each stage is a self-contained example folder; their READMEs link forward
 * and backward.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  type CreateMarketplaceRequest,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const MARKETPLACE_NAME = process.env['MARKETPLACE_NAME']
const REFERRAL_ADDRESS = process.env['REFERRAL_ADDRESS']
const REFERRAL_PCT_RAW = process.env['REFERRAL_PERCENTAGE']
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!MARKETPLACE_NAME) {
  console.error('Error: MARKETPLACE_NAME is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner:    ${wallet.address}`)
  console.log(`Network:  ${NETWORK}`)

  const request: CreateMarketplaceRequest = {
    name: MARKETPLACE_NAME as string,
  }
  if (REFERRAL_ADDRESS && REFERRAL_ADDRESS.length > 0) {
    request.referralAddress = REFERRAL_ADDRESS
  }
  if (REFERRAL_PCT_RAW !== undefined && REFERRAL_PCT_RAW !== '') {
    const pct = Number(REFERRAL_PCT_RAW)
    if (!Number.isFinite(pct) || pct < 0 || pct > 10_000) {
      throw new Error('REFERRAL_PERCENTAGE must be in [0, 10000].')
    }
    request.referralPercentage = pct
  }
  console.log('CreateMarketplace request:')
  console.log(JSON.stringify(request, null, 2))

  // -------------------------------------------------------------------------
  // Build, sign, broadcast or dry-run.
  // -------------------------------------------------------------------------
  const builder = new TransactionBuilder(provider)
  builder.sender(wallet.address).createMarketplace(request)
  const tx = await builder.build()
  const signed = await wallet.signTransaction(tx)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting.')
    await wallet.disconnect(true)
    return
  }

  const hash = await wallet.broadcastTransaction(signed)
  console.log(`Marketplace tx hash: ${hash}`)
  console.log(`Explorer:            ${provider.getTransactionUrl(hash)}`)
  console.log(
    'After mining, read the receipt to find the marketplaceId (a 64-hex string used by flow 40).',
  )
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('marketplace-create failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
