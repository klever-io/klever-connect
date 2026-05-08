/**
 * Example: send-nft-transfer-with-royalties (Flow 19, Node side)
 *
 * Transfers a single NFT and pays royalties to the collection's configured
 * royalty receiver. Royalties can be denominated in:
 *
 *   - KLV (native) → field `klvRoyalties` on the Transfer request
 *   - The same KDA being transferred → field `kdaRoyalties`
 *
 * Both fields are optional and additive; if the collection mandates a royalty
 * percentage, the chain validates that the supplied value meets the minimum.
 *
 * The umbrella `@klever/connect` does not export `createTransferWithRoyalties`,
 * so we build the transfer params object inline. The shape is identical:
 *   { receiver, amount, kda, klvRoyalties?, kdaRoyalties? }
 *
 * For non-NFT transfers see `send-kda-transfer` (no royalties).
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  ValidationError,
  isValidAddress,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const RECIPIENT = process.argv[2] ?? process.env['KLV_RECIPIENT']
const NFT_ID = process.env['KLV_NFT_ID']
const KLV_ROYALTIES = process.env['KLV_ROYALTIES_KLV'] ?? '0'
const KDA_ROYALTIES = process.env['KLV_ROYALTIES_KDA'] ?? '0'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!NFT_ID) {
  console.error('Error: KLV_NFT_ID is required (e.g. "MNFT-ABCD/1").')
  process.exit(1)
}
if (!RECIPIENT) {
  console.error('Error: pass the recipient as argv[2] or set KLV_RECIPIENT.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)

  try {
    if (!isValidAddress(RECIPIENT as string)) {
      throw new ValidationError(`Invalid recipient address: ${RECIPIENT}`)
    }
    console.log(`Recipient:    ${RECIPIENT}`)
    console.log(`NFT:          ${NFT_ID}`)
    console.log(`klvRoyalties: ${KLV_ROYALTIES}`)
    console.log(`kdaRoyalties: ${KDA_ROYALTIES}`)

    // Build the transfer params object. NFTs are always transferred with `amount: 1`.
    // Cast bigint to keep the smallest-units invariant explicit.
    const transferParams = {
      receiver: RECIPIENT as string,
      amount: 1n,
      kda: NFT_ID as string,
      ...(KLV_ROYALTIES !== '0' ? { klvRoyalties: BigInt(KLV_ROYALTIES) } : {}),
      ...(KDA_ROYALTIES !== '0' ? { kdaRoyalties: BigInt(KDA_ROYALTIES) } : {}),
    }

    const result = await wallet.transfer(transferParams)
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
  console.error('send-nft-transfer-with-royalties failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
