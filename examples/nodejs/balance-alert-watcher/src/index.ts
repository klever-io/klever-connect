/**
 * Example: balance-alert-watcher (Flow 54)
 *
 * Polls one or more addresses and emits an alert when their balance changes by
 * at least `MIN_DELTA` raw smallest units. Useful for hot-wallet monitoring,
 * faucet uptime checks, or notifying ops on large outflows.
 *
 * Architecture
 * ------------
 *   - One in-memory map of `address -> lastBalance: bigint`.
 *   - One poll cycle re-fetches each address concurrently.
 *   - Any |delta| >= MIN_DELTA logs an alert with the direction (incoming/outgoing).
 *
 * Salvaged from `_legacy/nodejs/automation/balance-alert.js` (rewritten in TS).
 */

import 'node:process'

import {
  KleverProvider,
  formatKLV,
  type KleverAddress,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const ADDRESSES_RAW = process.env['ADDRESSES']
const ASSET_ID = process.env['ASSET_ID'] ?? 'KLV'
const POLL_INTERVAL_MS = Number(process.env['POLL_INTERVAL_MS'] ?? '8000')
const MIN_DELTA = BigInt(process.env['MIN_DELTA'] ?? '1')
const MAX_POLLS = Number(process.env['MAX_POLLS'] ?? '10')

if (!ADDRESSES_RAW) {
  console.error('Error: ADDRESSES is required (comma-separated klv1 addresses).')
  process.exit(1)
}

const addresses = ADDRESSES_RAW.split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0) as KleverAddress[]

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const last = new Map<string, bigint>()

  console.log(`Network:        ${NETWORK}`)
  console.log(`Asset:          ${ASSET_ID}`)
  console.log(`Watching:       ${addresses.length} address(es)`)
  console.log(`Poll interval:  ${POLL_INTERVAL_MS}ms`)
  console.log(`Min delta:      ${MIN_DELTA}`)

  let pollCount = 0
  const tick = async (): Promise<void> => {
    pollCount++
    await Promise.all(
      addresses.map(async (addr) => {
        try {
          const balance = await provider.getBalance(addr, ASSET_ID)
          const cur = typeof balance === 'bigint' ? balance : BigInt(String(balance))
          const prev = last.get(addr)
          if (prev === undefined) {
            last.set(addr, cur)
            console.log(`[init] ${addr} = ${formatKLV(cur)} (raw=${cur})`)
            return
          }
          const delta = cur - prev
          const absDelta = delta < 0n ? -delta : delta
          if (absDelta >= MIN_DELTA) {
            const dir = delta > 0n ? 'INCOMING' : 'OUTGOING'
            console.log(
              `[alert] ${addr} ${dir} delta=${delta} (raw) — new balance ${formatKLV(cur)}`,
            )
            last.set(addr, cur)
          }
        } catch (err) {
          console.error(
            `[error] ${addr}: ${err instanceof Error ? err.message : String(err)}`,
          )
        }
      }),
    )
    if (MAX_POLLS > 0 && pollCount >= MAX_POLLS) {
      console.log(`Reached MAX_POLLS=${MAX_POLLS}. Exiting.`)
      process.exit(0)
    }
  }

  await tick()
  setInterval(() => {
    void tick()
  }, POLL_INTERVAL_MS)

  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.once(sig, () => {
      console.log(`Received ${sig} — exiting.`)
      process.exit(0)
    })
  }
}

main().catch((err) => {
  console.error('balance-alert-watcher failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
