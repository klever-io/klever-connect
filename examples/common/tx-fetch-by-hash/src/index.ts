/**
 * Flow #13 — tx-fetch-by-hash
 *
 * Look up an on-chain transaction given its hash. Demonstrates:
 *   - provider.getTransaction(hash)         -> full tx record
 *   - provider.getTransactionReceipt(hash)  -> receipt (logs + events)
 *   - provider.getTransactionUrl(hash)      -> the canonical explorer URL
 *   - createTransactionHash(...)            validate-and-brand
 */

import {
  KleverProvider,
  createTransactionHash,
  isTransactionHash,
} from '@klever/connect'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const rawHash = process.env['KLV_TX_HASH']
  if (!rawHash) {
    throw new Error(
      'Set KLV_TX_HASH in .env (find a hash in the testnet explorer: https://testnet.klever.finance).',
    )
  }
  if (!isTransactionHash(rawHash)) {
    throw new Error(`Not a valid 64-char hex tx hash: ${rawHash}`)
  }
  const hash = createTransactionHash(rawHash)

  console.log(`Network : ${network}`)
  console.log(`Hash    : ${hash}\n`)

  // --- Full transaction ------------------------------------------------------
  const tx = await provider.getTransaction(hash)
  console.log('Transaction:')
  // Print a compact subset of fields; the full payload is large.
  console.log(`  blockNumber : ${(tx as { blockNum?: number; blockNumber?: number }).blockNum ?? (tx as { blockNumber?: number }).blockNumber ?? '?'}`)
  console.log(`  status      : ${(tx as { status?: string }).status ?? '?'}`)
  console.log(`  sender      : ${(tx as { sender?: string }).sender ?? '?'}`)
  console.log(`  contractType: ${(tx as { contractType?: number }).contractType ?? '?'}`)
  console.log(`  fee (KLV)   : ${(tx as { fee?: string }).fee ?? '?'}`)

  // --- Receipt (events / logs) ----------------------------------------------
  try {
    const receipt = await provider.getTransactionReceipt(hash)
    const logs = (receipt as { logs?: unknown[] }).logs ?? []
    const receipts = (receipt as { receipts?: unknown[] }).receipts ?? []
    console.log(`\nReceipt:`)
    console.log(`  receipts : ${receipts.length}`)
    console.log(`  logs     : ${logs.length}`)
  } catch (err) {
    console.warn('  (no receipt available — tx may be pending or failed)', err)
  }

  // --- Explorer URL ----------------------------------------------------------
  // Drops the user straight into the canonical block explorer for whichever
  // network the provider is bound to.
  const url = provider.getTransactionUrl(hash)
  console.log(`\nExplorer URL: ${url}`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
