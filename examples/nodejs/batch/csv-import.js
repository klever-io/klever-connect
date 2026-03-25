/**
 * CSV Import Batch Transfers
 *
 * Reads a CSV file with recipient/amount pairs and submits them as a batch.
 * Demonstrates file I/O integration, input validation, and batch processing.
 *
 * CSV format (no header row):
 *   klv1receiver1,1.5
 *   klv1receiver2,0.5
 *
 * Or with header:
 *   address,amount
 *   klv1receiver1,1.5
 *
 * Usage:
 *   node batch/csv-import.js transfers.csv
 *   ASSET_ID=TOKEN-ABCD node batch/csv-import.js transfers.csv
 *   DRY_RUN=true node batch/csv-import.js transfers.csv
 *
 * Environment variables:
 *   PRIVATE_KEY - 64-char hex private key (required)
 *   NETWORK     - Network to use (default: testnet)
 *   ASSET_ID    - KDA token to send (optional, defaults to KLV)
 *   DRY_RUN     - Set to "true" to validate without broadcasting
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  parseKLV,
  isValidAddress,
} from '@klever/connect'

const NETWORK = process.env.NETWORK || 'testnet'
const DRY_RUN = process.env.DRY_RUN === 'true'
const ASSET_ID = process.env.ASSET_ID

function parseCSV(filePath) {
  const content = readFileSync(resolve(filePath), 'utf-8')
  const lines = content.trim().split('\n')

  const transfers = []
  const errors = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const [addressRaw, amountRaw] = line.split(',').map((s) => s.trim())

    // Skip header row
    if (i === 0 && addressRaw.toLowerCase() === 'address') continue

    if (!addressRaw || !amountRaw) {
      errors.push(`Line ${i + 1}: missing address or amount`)
      continue
    }

    if (!isValidAddress(addressRaw)) {
      errors.push(`Line ${i + 1}: invalid address "${addressRaw}"`)
      continue
    }

    const amount = parseFloat(amountRaw)
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Line ${i + 1}: invalid amount "${amountRaw}"`)
      continue
    }

    transfers.push({ receiver: addressRaw, amount: amountRaw })
  }

  return { transfers, errors }
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: node batch/csv-import.js <path-to-csv>')
    process.exit(1)
  }

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY is required')
    process.exit(1)
  }

  // Parse CSV
  const { transfers, errors } = parseCSV(csvPath)

  if (errors.length > 0) {
    console.error(`CSV validation errors:`)
    errors.forEach((e) => console.error(`  ${e}`))
    process.exit(1)
  }

  if (transfers.length === 0) {
    console.log('No transfers found in CSV')
    process.exit(0)
  }

  console.log(`Parsed ${transfers.length} transfer(s) from ${csvPath}`)
  console.log(`Asset:   ${ASSET_ID ?? 'KLV'}`)
  console.log(`Network: ${NETWORK}`)
  console.log(`Dry run: ${DRY_RUN}`)
  console.log('')

  if (DRY_RUN) {
    console.log('DRY RUN — transactions would be:')
    transfers.forEach((t, i) => {
      console.log(`  [${i + 1}] ${t.amount} ${ASSET_ID ?? 'KLV'} → ${t.receiver}`)
    })
    process.exit(0)
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log(`Sender: ${wallet.address}`)

  // Get nonce once
  const account = await provider.getAccount(wallet.address)
  let nonce = account.nonce

  // Build and sign all transactions offline
  const signedTxs = []
  for (const transfer of transfers) {
    const tx = await new TransactionBuilder(provider)
      .sender(wallet.address)
      .nonce(nonce++)
      .transfer({
        receiver: transfer.receiver,
        amount: parseKLV(transfer.amount),
        ...(ASSET_ID ? { kda: ASSET_ID } : {}),
      })
      .build()

    signedTxs.push(await wallet.signTransaction(tx))
  }

  // Submit batch
  const hashes = await wallet.broadcastTransactions(signedTxs)

  console.log(`\nBatch submitted! ${hashes.length} transactions:`)
  hashes.forEach((hash, i) => {
    console.log(`  [${i + 1}] ${hash}`)
  })

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
