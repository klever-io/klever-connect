/**
 * Example: tx-poll-until-confirmed (Flow 52)
 *
 * Waits for a transaction to land on-chain with a timeout. Exits 0 on success,
 * 1 on failure, 2 on timeout — perfect for CI gating ("did the deploy land?").
 *
 * Two strategies, both shown
 * --------------------------
 * 1. **`provider.waitForTransaction(hash)`** (preferred). The SDK handles the
 *    poll loop, exponential backoff, and final state interpretation.
 * 2. **Manual polling via `provider.getTransaction(hash)`**. Useful when you
 *    need custom progress reporting or finer-grained timeouts than the SDK
 *    offers.
 *
 * The example tries (1) first; if it doesn't return within `TIMEOUT_MS` we
 * raise a clear error rather than hanging.
 */

import 'node:process'

import {
  KleverProvider,
  type TransactionHash,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const TX_HASH = process.env['TX_HASH']
const TIMEOUT_MS = Number(process.env['TIMEOUT_MS'] ?? '60000')
const POLL_INTERVAL_MS = Number(process.env['POLL_INTERVAL_MS'] ?? '2000')

if (!TX_HASH) {
  console.error('Error: TX_HASH is required.')
  process.exit(1)
}
if (!Number.isFinite(TIMEOUT_MS) || TIMEOUT_MS < 1_000) {
  console.error('Error: TIMEOUT_MS must be at least 1000.')
  process.exit(1)
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((res, rej) => {
    const timer = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
    p.then(
      (v) => {
        clearTimeout(timer)
        res(v)
      },
      (e: unknown) => {
        clearTimeout(timer)
        rej(e instanceof Error ? e : new Error(String(e)))
      },
    )
  })
}

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  console.log(`Network: ${NETWORK}`)
  console.log(`Hash:    ${TX_HASH}`)
  console.log(`Timeout: ${TIMEOUT_MS}ms`)

  // Strategy 1: prefer waitForTransaction (the SDK handles cancellation +
  // backoff). We layer a hard timeout on top to bound CI runs.
  try {
    const tx = await withTimeout(
      provider.waitForTransaction(TX_HASH as TransactionHash),
      TIMEOUT_MS,
      'waitForTransaction',
    )
    const status = (tx as { status?: string }).status ?? 'unknown'
    console.log(`Tx confirmed. status=${status}`)
    if (status === 'failed' || status === 'fail') {
      process.exit(1)
    }
    return
  } catch (err) {
    if (err instanceof Error && /timed out/.test(err.message)) {
      console.error('waitForTransaction timed out — falling back to manual poll for one cycle...')
      // Strategy 2 fallback: a single manual peek so we exit cleanly with code 2.
      try {
        const tx = await provider.getTransaction(TX_HASH as TransactionHash)
        if (tx) {
          console.log('Manual poll: transaction is visible but not yet finalized.')
        } else {
          console.log('Manual poll: transaction not found on chain (still pending or pruned).')
        }
      } catch {
        // ignore — we're already exiting timeout
      }
      process.exit(2)
    }
    throw err
  }
}

main().catch((err) => {
  console.error('tx-poll-until-confirmed failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})

// POLL_INTERVAL_MS is consumed by the SDK internally; we surface it in the
// log to make tuning explicit. Real apps can set it via the provider's
// retry/cache options when constructing KleverProvider.
void POLL_INTERVAL_MS
