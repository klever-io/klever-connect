/**
 * Example: kda-burn (Flow 30)
 *
 * Burns KDA supply. The signing wallet either holds the tokens directly or
 * has been granted the burn role on the asset.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 11, triggerType: 1, assetId, amount })`
 *   - contractType 11 = TXType.AssetTrigger
 *   - triggerType 1   = Burn
 *
 * Edge cases
 * ----------
 * - For NFT burns, the assetId is the FULL nft id (`COLLECTION-XXXX/<nonce>`)
 *   and the amount must be 1.
 * - Burning more than your balance fails on-chain.
 * - Burning is irreversible — there is no on-chain unburn.
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const KDA_ID = process.env['KLV_KDA_ID']
const AMOUNT = process.env['KLV_BURN_AMOUNT'] ?? '1000'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID) {
  console.error('Error: KLV_KDA_ID is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)
  console.log(`Burning ${AMOUNT} of ${KDA_ID}`)

  try {
    const result = await wallet.sendTransaction({
      contractType: 11, // TXType.AssetTrigger
      triggerType: 1, // Burn
      assetId: KDA_ID as string,
      amount: BigInt(AMOUNT),
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
  console.error('kda-burn failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
