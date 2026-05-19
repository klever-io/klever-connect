/**
 * Flow #61 — sc-events-parse
 *
 * Smart contracts emit events via the `#[event(...)]` macro in klever-sc.
 * The chain stores them as `logs[]` on the tx receipt with topics + data
 * as raw bytes.
 *
 * `Contract.parseEvents(logs, filter?)` decodes the logs back into typed
 * events:
 *
 *   contract.parseEvents(receipt.logs)
 *     -> [{ identifier: 'counter_changed', args: { new_value: 42n } }, ...]
 *
 * This example assumes the counter contract was incremented (or `add` was
 * called) via `nodejs/sc-invoke-mutable/`, leaving a tx hash whose receipt
 * carries a `counter_changed` event.
 */

import {
  Contract,
  KleverProvider,
  createKleverAddress,
  isValidAddress,
  createTransactionHash,
  isTransactionHash,
} from '@klever/connect'
import counterAbi from './counter-abi.json' with { type: 'json' }

async function main(): Promise<void> {
  const network = (process.env['KLV_NETWORK'] ?? 'testnet') as
    | 'mainnet' | 'testnet' | 'devnet' | 'local'
  const provider = new KleverProvider({ network })

  const rawAddr = process.env['COUNTER_ADDRESS']
  if (!rawAddr || !isValidAddress(rawAddr)) {
    throw new Error('Set COUNTER_ADDRESS in .env to a deployed counter contract.')
  }
  const address = createKleverAddress(rawAddr)

  const rawHash = process.env['KLV_TX_HASH']
  if (!rawHash || !isTransactionHash(rawHash)) {
    throw new Error(
      'Set KLV_TX_HASH in .env to a counter increment/add tx hash. Generate one via nodejs/sc-invoke-mutable/.',
    )
  }
  const hash = createTransactionHash(rawHash)

  // Build the Contract once — its ABI is what tells parseEvents how to decode.
  const contract = new Contract(address, counterAbi, provider)

  // Pull the raw logs off the receipt.
  const receipt = await provider.getTransactionReceipt(hash)
  const logs = (receipt as { logs?: unknown[] }).logs ?? []

  console.log(`Network         : ${network}`)
  console.log(`Contract        : ${address}`)
  console.log(`Tx hash         : ${hash}`)
  console.log(`Raw logs        : ${logs.length}\n`)

  // Decode them via the Contract's ABI.
  const events = contract.parseEvents(logs as Parameters<typeof contract.parseEvents>[0])
  console.log(`Decoded events  : ${events.length}\n`)
  for (const [i, ev] of events.entries()) {
    console.log(`  event[${i}] identifier=${ev.identifier}`)
    console.log(`             args=${JSON.stringify(ev.args, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))}`)
  }

  // Optional: filter by identifier — useful for indexers that only care about
  // a single event type.
  const onlyCounterChanged = contract.parseEvents(
    logs as Parameters<typeof contract.parseEvents>[0],
    { identifier: 'counter_changed' },
  )
  console.log(`\nFiltered (only counter_changed): ${onlyCounterChanged.length}`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
