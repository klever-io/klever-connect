/**
 * Flow #56 — tx-receipt-parse
 *
 * On-chain receipts are heterogeneous: each tx type emits a different shape.
 * The SDK ships `parseReceipt` to dispatch on the receipt type and return a
 * strongly-typed payload (FreezeReceiptData, DelegateReceiptData, ...).
 *
 * `parseReceipt` lives in `@klever/connect-provider`. It is NOT (yet)
 * re-exported by the umbrella `@klever/connect` — this example imports it
 * from the sub-package as a documented exception.
 */

import {
  KleverProvider,
  createTransactionHash,
  isTransactionHash,
} from '@klever/connect'

// TODO(KLC-2322): once umbrella re-exports `parseReceipt`, switch to
// `from '@klever/connect'`.
import { parseReceipt } from '@klever/connect-provider'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const rawHash = process.env['KLV_TX_HASH']
  if (!rawHash) throw new Error('Set KLV_TX_HASH in .env to a tx hash whose receipt you want to decode.')
  if (!isTransactionHash(rawHash)) throw new Error(`Not a 64-char hex hash: ${rawHash}`)
  const hash = createTransactionHash(rawHash)

  console.log(`Network : ${network}`)
  console.log(`Hash    : ${hash}\n`)

  const txReceipt = await provider.getTransactionReceipt(hash)
  const receipts = (txReceipt as { receipts?: unknown[] }).receipts ?? []

  if (receipts.length === 0) {
    console.log('(no receipts on this transaction)')
    return
  }

  console.log(`Found ${receipts.length} raw receipt(s). Decoding via parseReceipt():\n`)
  for (const [i, raw] of receipts.entries()) {
    try {
      const decoded = parseReceipt(raw as Parameters<typeof parseReceipt>[0])
      console.log(`  receipt[${i}] type=${(decoded as { type?: string | number }).type}`)
      console.log(`             ${JSON.stringify(decoded)}`)
    } catch (err) {
      console.warn(
        `  receipt[${i}] parseReceipt failed: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
