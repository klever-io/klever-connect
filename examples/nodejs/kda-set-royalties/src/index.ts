/**
 * Example: kda-set-royalties (Flow 33)
 *
 * Configures an asset's royalty schedule. The chain stores both a transfer-time
 * royalty (paid by sender to royaltyReceiver on every transfer) and a
 * marketplace-sale royalty (paid by buyer on a marketplace sale).
 *
 * Each can be expressed as:
 *   - a percentage (basis points: 10000 = 100.00%)
 *   - a fixed amount (smallest units)
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 11, triggerType: 14, assetId, royalties: {...} })`
 *   - contractType 11 = TXType.AssetTrigger
 *   - triggerType 14  = UpdateRoyalties
 *
 * The umbrella does not export a typed `RoyaltiesInfo`; we build the object
 * inline with the documented field names.
 */

import 'node:process'

import { KleverProvider, NodeWallet, ValidationError, isValidAddress } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const KDA_ID = process.env['KLV_KDA_ID']
const ROYALTIES_ADDRESS = process.env['KLV_ROYALTIES_ADDRESS']
const TRANSFER_PCT = Number(process.env['KLV_ROYALTIES_TRANSFER_PERCENTAGE'] ?? '500')
const TRANSFER_FIXED = process.env['KLV_ROYALTIES_TRANSFER_FIXED'] ?? '0'
const MARKET_PCT = Number(process.env['KLV_ROYALTIES_MARKET_PERCENTAGE'] ?? '500')
const MARKET_FIXED = process.env['KLV_ROYALTIES_MARKET_FIXED'] ?? '0'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID || !ROYALTIES_ADDRESS) {
  console.error('Error: KLV_KDA_ID and KLV_ROYALTIES_ADDRESS are required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Owner: ${wallet.address}`)

  try {
    if (!isValidAddress(ROYALTIES_ADDRESS as string)) {
      throw new ValidationError(`Invalid royalties address: ${ROYALTIES_ADDRESS}`)
    }
    console.log(
      `Setting royalties on ${KDA_ID}: receiver=${ROYALTIES_ADDRESS} transfer=${TRANSFER_PCT}bps+${TRANSFER_FIXED} market=${MARKET_PCT}bps+${MARKET_FIXED}`,
    )

    const result = await wallet.sendTransaction({
      contractType: 11, // TXType.AssetTrigger
      triggerType: 14, // UpdateRoyalties
      assetId: KDA_ID as string,
      royalties: {
        address: ROYALTIES_ADDRESS as string,
        transferPercentage: [
          { amount: BigInt(TRANSFER_FIXED), percentage: TRANSFER_PCT },
        ],
        marketPercentage: MARKET_PCT,
        marketFixed: BigInt(MARKET_FIXED),
      },
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('kda-set-royalties failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
