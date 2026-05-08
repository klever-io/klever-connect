/**
 * Example: send-kda-transfer (Flow 18, Node side)
 *
 * Send a Klever Digital Asset (KDA) — fungible token or NFT — to a recipient.
 * The only difference from a KLV transfer is the `kda` field on `wallet.transfer`.
 *
 * Notes on amount precision
 * -------------------------
 * - KDA tokens have asset-defined precision (often 6, sometimes 0/2/8).
 *   `parseKLV` is hard-coded to 6 decimals and is the WRONG choice for arbitrary KDAs.
 *   Use `parseUnits(amountString, precision)` from the umbrella, OR pass the amount
 *   in smallest units directly (this example accepts smallest units via `KLV_AMOUNT`).
 * - For NFT nonce transfers, the asset id has the form `COLLECTION-XXXX/<nonce>`
 *   and the amount is always `1`.
 *
 * See `examples/nodejs/send-klv-transfer/` for the native-KLV variant and
 * `examples/nodejs/send-nft-transfer-with-royalties/` for NFT royalty handling.
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
const KDA_ID = process.env['KLV_KDA_ID']
const AMOUNT = process.env['KLV_AMOUNT'] ?? '1'

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}
if (!KDA_ID) {
  console.error('Error: KLV_KDA_ID is required (e.g. "MTT-ABCD" or "MNFT-ABCD/1").')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)

  try {
    const recipient = RECIPIENT ?? wallet.address
    if (!isValidAddress(recipient)) {
      throw new ValidationError(`Invalid recipient address: ${recipient}`)
    }
    console.log(`Recipient: ${recipient}`)
    console.log(`Asset:     ${KDA_ID}`)
    console.log(`Amount:    ${AMOUNT} (smallest units)`)

    // The only addition vs. a KLV transfer is `kda`. Behind the scenes this still
    // builds a Transfer (contractType=0) tx — the chain reads the `kda` field to
    // route the value movement to that asset's ledger entry.
    const result = await wallet.transfer({
      receiver: recipient,
      amount: BigInt(AMOUNT),
      kda: KDA_ID as string,
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
  console.error('send-kda-transfer failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
