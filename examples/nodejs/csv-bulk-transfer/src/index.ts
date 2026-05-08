/**
 * Example: csv-bulk-transfer (Flow 51)
 *
 * Reads a CSV file from disk, parses it with `csv-parse`, builds a transfer
 * transaction per row with manually-managed nonces, and broadcasts in batches
 * (size configurable). Mirrors the pattern of `tx-bulk-broadcast` (flow 50)
 * but adds I/O.
 *
 * CSV expectations
 * ----------------
 *   header row required: receiver,amount,kda
 *   - receiver: bech32 klv1 address (validated below)
 *   - amount:   either raw smallest units (AMOUNT_UNIT=raw)
 *               or human KLV (AMOUNT_UNIT=human, default; only KLV is converted)
 *   - kda:      optional — leave blank for KLV transfer
 *
 * Validation strategy: parse the entire file BEFORE building any tx, so we
 * fail fast on malformed rows without leaving the chain in a half-broadcast
 * state.
 */

import 'node:process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { parse as csvParse } from 'csv-parse/sync'
import {
  KleverProvider,
  NodeWallet,
  TransactionBuilder,
  parseKLV,
  isValidAddress,
  type AmountLike,
  type KleverAddress,
  type Transaction,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const PRIVATE_KEY = process.env['PRIVATE_KEY']
const CSV_PATH = resolve(process.env['CSV_PATH'] ?? './recipients.csv')
const AMOUNT_UNIT = (process.env['AMOUNT_UNIT'] ?? 'human').toLowerCase()
const BATCH_SIZE = Math.max(1, Number(process.env['BATCH_SIZE'] ?? '50'))
const DRY_RUN = (process.env['DRY_RUN'] ?? 'true').toLowerCase() === 'true'

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is required.')
  process.exit(1)
}
if (!existsSync(CSV_PATH)) {
  console.error(`Error: CSV not found at ${CSV_PATH}.`)
  process.exit(1)
}

interface CsvRow {
  receiver: string
  amount: string
  kda?: string
}

interface PreparedTransfer {
  receiver: string
  amount: AmountLike
  kda?: string
}

function parseCsv(path: string): PreparedTransfer[] {
  const raw = readFileSync(path, 'utf-8')
  const rows = csvParse(raw, { columns: true, skip_empty_lines: true, trim: true }) as CsvRow[]
  const out: PreparedTransfer[] = []
  rows.forEach((row, idx) => {
    if (!row.receiver) {
      throw new Error(`Row ${idx + 2}: missing "receiver".`)
    }
    if (!isValidAddress(row.receiver)) {
      throw new Error(`Row ${idx + 2}: invalid receiver "${row.receiver}".`)
    }
    if (!row.amount) {
      throw new Error(`Row ${idx + 2}: missing "amount".`)
    }
    const isKlv = !row.kda || row.kda === 'KLV' || row.kda.length === 0
    let amount: AmountLike
    if (isKlv && AMOUNT_UNIT === 'human') {
      amount = parseKLV(row.amount)
    } else {
      amount = row.amount
    }
    out.push({ receiver: row.receiver, amount, ...(row.kda ? { kda: row.kda } : {}) })
  })
  return out
}

async function main(): Promise<void> {
  const transfers = parseCsv(CSV_PATH)
  if (transfers.length === 0) {
    console.error('CSV had a header but no rows.')
    process.exit(1)
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, PRIVATE_KEY as string)
  await wallet.connect()
  console.log(`Sender:     ${wallet.address}`)
  console.log(`Network:    ${NETWORK}`)
  console.log(`Recipients: ${transfers.length}`)
  console.log(`Batch size: ${BATCH_SIZE}`)

  // Single nonce-fetch.
  const account = await provider.getAccount(wallet.address as KleverAddress)
  const baseNonce = account.nonce
  console.log(`Base nonce: ${baseNonce}`)

  // Build + sign in order.
  const signed: Transaction[] = []
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i]!
    const builder = new TransactionBuilder(provider)
    builder
      .sender(wallet.address)
      .nonce(baseNonce + i)
      .transfer({
        receiver: t.receiver,
        amount: t.amount,
        ...(t.kda ? { kda: t.kda } : {}),
      })
    const tx = await builder.build()
    signed.push(await wallet.signTransaction(tx))
  }
  console.log(`Built and signed ${signed.length} transactions.`)

  if (DRY_RUN) {
    console.log('DRY_RUN=true — not broadcasting. Re-run with DRY_RUN=false to send.')
    await wallet.disconnect(true)
    return
  }

  // Slice into batches.
  let cursor = 0
  let batchIdx = 1
  while (cursor < signed.length) {
    const slice = signed.slice(cursor, cursor + BATCH_SIZE)
    console.log(`Broadcasting batch ${batchIdx} (${slice.length} txs)...`)
    const hashes = await wallet.broadcastTransactions(slice)
    for (const [j, h] of hashes.entries()) {
      console.log(`  [${cursor + j + 1}/${signed.length}] ${h}`)
    }
    cursor += BATCH_SIZE
    batchIdx++
  }
  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error('csv-bulk-transfer failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
