/**
 * Example: kda-mint (Flow 29)
 *
 * Mints additional supply for a fungible KDA OR mints a single new NFT into a
 * non-fungible collection. Both operations use the same SDK call:
 *
 *   `wallet.sendTransaction({ contractType: 11, triggerType: 0, ... })`
 *     - contractType 11 = TXType.AssetTrigger
 *     - triggerType 0   = Mint
 *
 * Required role
 * -------------
 * The signing wallet must be either the asset owner OR have been granted a mint
 * role via `kda-add-role` (Flow 31). Otherwise the chain rejects with a role error.
 *
 * Fungible vs NFT mint
 * --------------------
 * - Fungible: provide `assetId`, `amount`, optional `receiver`.
 *   The chain credits `amount` to `receiver` (or sender if omitted) and bumps
 *   the on-chain `circulatingSupply` of the asset.
 * - NFT:      provide `assetId` (collection only), optional `uris`/`mime`.
 *   The chain assigns the next nonce and emits the new NFT id in the receipt
 *   (`<assetId>/<nonce>`).
 */

import 'node:process'

import { KleverProvider, NodeWallet } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const KDA_ID = process.env['KLV_KDA_ID']
const MODE = (process.env['KLV_MINT_MODE'] ?? 'fungible') as 'fungible' | 'nft'
const AMOUNT = process.env['KLV_MINT_AMOUNT'] ?? '1000000'
const RECEIVER = process.env['KLV_MINT_RECEIVER']
const URIS = process.env['KLV_MINT_NFT_URIS']
const MIME = process.env['KLV_MINT_NFT_MIME']

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

  try {
    if (MODE === 'fungible') {
      const receiver = RECEIVER ?? wallet.address
      console.log(`Minting ${AMOUNT} of ${KDA_ID} to ${receiver} (fungible)`)
      const result = await wallet.sendTransaction({
        contractType: 11, // TXType.AssetTrigger
        triggerType: 0, // Mint
        assetId: KDA_ID as string,
        receiver,
        amount: BigInt(AMOUNT),
      })
      console.log(`Submitted: hash=${result.hash} status=${result.status}`)
      if (result.wait) {
        const receipt = await result.wait()
        console.log(`Confirmed: status=${receipt.status}`)
      }
    } else if (MODE === 'nft') {
      const parsedUris = URIS
        ? (JSON.parse(URIS) as Record<string, string>)
        : { image: 'https://example.com/nft.png', metadata: 'https://example.com/nft.json' }
      console.log(`Minting NFT into ${KDA_ID} (next nonce assigned by chain)`)
      const result = await wallet.sendTransaction({
        contractType: 11, // TXType.AssetTrigger
        triggerType: 0, // Mint
        assetId: KDA_ID as string,
        receiver: RECEIVER ?? wallet.address,
        uris: parsedUris,
        ...(MIME ? { mime: MIME } : {}),
      })
      console.log(`Submitted: hash=${result.hash} status=${result.status}`)
      if (result.wait) {
        const receipt = await result.wait()
        console.log(`Confirmed: status=${receipt.status}`)
        console.log(
          `Find the new NFT id (e.g. ${KDA_ID}/<nonce>) on the explorer: https://kleverscan.org/transaction/${result.hash}`,
        )
      }
    } else {
      throw new Error(`Unknown KLV_MINT_MODE: ${MODE} (expected "fungible" or "nft")`)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('kda-mint failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
