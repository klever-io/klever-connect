/**
 * Example: freeze-for-staking (Flow 20, Node side, stage 1 of the staking chain)
 *
 * Freeze KLV (or a KDA) to participate in staking.
 *
 * Why freeze?
 * -----------
 * - Frozen KLV creates a "bucket" that you can later delegate to a validator
 *   (Flow 22), undelegate (Flow 23), unfreeze (Flow 21), and finally withdraw
 *   after the cooldown (Flow 25).
 * - Frozen KDA has no bucket; it joins an asset-specific FPR pool (if the asset
 *   was created with the right flags). The full FPR/KDA-staking flow is its own
 *   topic — this example focuses on the KLV bucket case.
 *
 * Reading the bucket id from the receipt
 * --------------------------------------
 * The umbrella `@klever/connect` does not export the typed `parseReceipt` helper.
 * After confirmation, use `result.wait?.()` to get the receipt array, then look
 * for a Freeze receipt entry — its `bucketId` is what you'll use in flows 21-25.
 *
 * The Klever explorer also shows the bucket id under the tx detail page; copy
 * it from there if you don't want to wire receipt parsing yourself.
 *
 * SDK call
 * --------
 * `wallet.sendTransaction({ contractType: 4, amount, kda? })`
 *   - contractType 4 = TXType.Freeze
 *   - amount is in smallest units (KLV: 6 decimals)
 *   - kda is optional; omit for native KLV.
 */

import 'node:process'

import { KleverProvider, NodeWallet, parseKLV } from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']
const FREEZE_AMOUNT = process.env['KLV_FREEZE_AMOUNT'] ?? '100'
const FREEZE_KDA = process.env['KLV_FREEZE_KDA'] || undefined

if (!PRIVATE_KEY) {
  console.error('Error: KLV_PRIVATE_KEY is required.')
  process.exit(1)
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender: ${wallet.address}`)

  try {
    // For native KLV, parseKLV converts "100" -> 100_000_000n.
    // For a 6-decimal KDA the same parser works; for other precisions, prefer
    // `parseUnits(amount, precision)`.
    const amount = FREEZE_KDA ? BigInt(FREEZE_AMOUNT) : parseKLV(FREEZE_AMOUNT)

    console.log(`Freezing ${FREEZE_AMOUNT} ${FREEZE_KDA ?? 'KLV'} (${amount} smallest units)`)

    const result = await wallet.sendTransaction({
      contractType: 4, // TXType.Freeze
      amount,
      ...(FREEZE_KDA ? { kda: FREEZE_KDA } : {}),
    })
    console.log(`Submitted: hash=${result.hash} status=${result.status}`)

    if (result.wait) {
      const receipt = await result.wait()
      console.log(`Confirmed: status=${receipt.status}`)
      // The bucket id is inside `receipt.receipts` — its shape depends on the
      // SDK version. The simplest reliable workflow is to copy it from the
      // explorer, OR pull the tx via `provider.getTransactionReceipt(hash)`
      // and search for a `bucketId`-bearing entry.
      console.log('Look up the bucketId on the explorer or via provider.getTransactionReceipt(hash)')
      console.log(`  -> https://kleverscan.org/transaction/${result.hash}`)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('freeze-for-staking failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
