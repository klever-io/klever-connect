/**
 * Bulk Transfer
 *
 * Demonstrates sending multiple transactions to the network in a single
 * batch call, improving throughput for high-volume use cases.
 *
 * Features:
 * - Builds all transactions with incrementing nonces (no network round-trips per tx)
 * - Signs all transactions locally
 * - Broadcasts as a batch using broadcastTransactions()
 * - Reports success/failure per transaction
 *
 * Usage:
 *   node batch/bulk-transfer.js
 *
 * Environment variables:
 *   PRIVATE_KEY - 64-char hex private key (required)
 *   NETWORK     - Network to use (default: testnet)
 */

import 'dotenv/config'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  parseKLV,
  isValidAddress,
} from '@klever/connect'

const NETWORK = process.env.NETWORK || 'testnet'

// Sample batch of transfers. In production, load this from a database or CSV.
const TRANSFERS = [
  { receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5', amount: '0.01' },
  { receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5', amount: '0.02' },
  { receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5', amount: '0.03' },
]

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY is required')
    process.exit(1)
  }

  // Validate all recipients upfront
  const invalid = TRANSFERS.filter((t) => !isValidAddress(t.receiver))
  if (invalid.length > 0) {
    console.error(`Error: ${invalid.length} invalid receiver address(es) found`)
    process.exit(1)
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log(`Network:  ${NETWORK}`)
  console.log(`Sender:   ${wallet.address}`)
  console.log(`Batch:    ${TRANSFERS.length} transfers`)
  console.log('')

  // Get current nonce once (avoids N network calls)
  const account = await provider.getAccount(wallet.address)
  let nonce = account.nonce

  // Build and sign all transactions (node fills version/fees, nonce is set manually)
  const signedTxs = []
  for (const transfer of TRANSFERS) {
    const tx = await new TransactionBuilder(provider)
      .sender(wallet.address)
      .nonce(nonce++)
      .transfer({
        receiver: transfer.receiver,
        amount: parseKLV(transfer.amount),
      })
      .build()

    const signed = await wallet.signTransaction(tx)
    signedTxs.push(signed)
  }

  console.log(`Built and signed ${signedTxs.length} transactions`)

  // Broadcast all at once
  const hashes = await wallet.broadcastTransactions(signedTxs)

  console.log(`\nBatch submitted successfully!`)
  hashes.forEach((hash, i) => {
    const t = TRANSFERS[i]
    console.log(`  [${i + 1}] ${t.amount} KLV → ${t.receiver.slice(0, 20)}...`)
    console.log(`      Hash: ${hash}`)
  })

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
