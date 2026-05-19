/**
 * Flow #14 — block-fetch
 *
 * Two read methods:
 *   - provider.getBlockNumber()      -> latest block height (number)
 *   - provider.getBlock(idOrNum)     -> full block; accepts number, hash,
 *                                       or the literal 'latest'
 *
 * The block payload includes the transactions that landed in it, useful for
 * building indexers and explorers.
 */

import { KleverProvider } from '@klever/connect'

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  // Latest block height — useful for "wait N more blocks" patterns.
  const latest = await provider.getBlockNumber()
  console.log(`Latest block height: ${latest}`)

  // Choose which block to fetch.
  const explicit = process.env['KLV_BLOCK_NUMBER']
  const target = explicit ? Number.parseInt(explicit, 10) : 'latest'

  console.log(`Fetching block: ${target}\n`)

  const block = await provider.getBlock(target)

  // Print a small subset of fields. The full payload is large.
  const b = block as {
    blockNum?: number
    blockNumber?: number
    hash?: string
    timestamp?: number | string
    transactions?: unknown[]
  }
  console.log('Block:')
  console.log(`  number       : ${b.blockNum ?? b.blockNumber}`)
  console.log(`  hash         : ${b.hash ?? '?'}`)
  console.log(`  timestamp    : ${b.timestamp ?? '?'}`)
  console.log(`  transactions : ${(b.transactions ?? []).length}`)

  // Walk the transactions and print one line per tx (if any).
  const txs = (b.transactions ?? []) as Array<{ hash?: string; sender?: string; contractType?: number }>
  for (const [i, tx] of txs.slice(0, 5).entries()) {
    console.log(`    tx[${i}] ${tx.hash?.slice(0, 16)}... type=${tx.contractType} sender=${tx.sender?.slice(0, 16)}...`)
  }
  if (txs.length > 5) console.log(`    (... ${txs.length - 5} more)`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
