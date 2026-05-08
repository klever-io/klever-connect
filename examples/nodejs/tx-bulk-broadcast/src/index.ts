/**
 * Example: tx-bulk-broadcast (Flow 50)
 *
 * Build N transactions, sign each, and broadcast them in a single batch via
 * `wallet.broadcastTransactions(...)`. The trick is **nonce management**: each
 * transaction must use a unique, monotonically increasing nonce. We fetch the
 * starting nonce once and increment it locally for every subsequent build.
 *
 * Why manual nonces matter
 * ------------------------
 * Each call to `provider.getNonce(address)` returns the SAME current nonce
 * until at least one transaction is mined and the account state advances. So
 * if you naively rebuild N transactions and let each one fetch its own nonce,
 * you'll get N copies of the same nonce — and the chain will reject all but
 * one. The pattern below avoids that.
 *
 * Pattern (this example)
 * ----------------------
 *   1. fetch base nonce ONCE
 *   2. for each recipient:
 *        - build with TransactionBuilder.nonce(base + i)
 *        - sign locally
 *   3. wallet.broadcastTransactions(allSigned) — single network round-trip
 *
 * Salvaged from `_legacy/nodejs/batch/bulk-transfer.js` (rewritten in TS).
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  parseKLV,
  type KleverAddress,
  type Transaction,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const RECIPIENTS_JSON = process.env['RECIPIENTS_JSON']
const AMOUNT_UNIT = (process.env['AMOUNT_UNIT'] ?? 'raw').toLowerCase()
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!RECIPIENTS_JSON) {
  console.error('Error: RECIPIENTS_JSON is required.')
  process.exit(1)
}

interface RawRecipient {
  receiver: string
  amount: string | number
}

async function main(): Promise<void> {
  const recipients = JSON.parse(RECIPIENTS_JSON as string) as unknown
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('RECIPIENTS_JSON must be a non-empty array.')
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender:  ${wallet.address}`)
  console.log(`Network: ${NETWORK}`)
  console.log(`Recipients: ${recipients.length}`)

  // -------------------------------------------------------------------------
  // Step 1 — fetch the base nonce once.
  // -------------------------------------------------------------------------
  const account = await provider.getAccount(wallet.address as KleverAddress)
  const baseNonce = account.nonce
  console.log(`Base nonce: ${baseNonce}`)

  // -------------------------------------------------------------------------
  // Step 2 — build + sign each transaction with an incrementing nonce.
  // -------------------------------------------------------------------------
  const signed: Transaction[] = []
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i] as RawRecipient
    const amount =
      AMOUNT_UNIT === 'human' ? parseKLV(String(r.amount)) : String(r.amount)
    const builder = new TransactionBuilder(provider)
    builder
      .sender(wallet.address)
      .nonce(baseNonce + i)
      .transfer({ receiver: r.receiver, amount })
    const tx = await builder.build()
    const s = await wallet.signTransaction(tx)
    signed.push(s)
    console.log(
      `[${i + 1}/${recipients.length}] built nonce=${baseNonce + i} -> ${r.receiver}`,
    )
  }

  if (DRY_RUN) {
    console.log(`DRY_RUN=true — built ${signed.length} signed txs but not broadcasting.`)
    await wallet.disconnect(true)
    return
  }

  // -------------------------------------------------------------------------
  // Step 3 — single batch broadcast.
  // -------------------------------------------------------------------------
  const hashes = await wallet.broadcastTransactions(signed)
  for (const [i, h] of hashes.entries()) {
    console.log(`[${i + 1}/${hashes.length}] tx hash: ${h}`)
  }
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('tx-bulk-broadcast failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
