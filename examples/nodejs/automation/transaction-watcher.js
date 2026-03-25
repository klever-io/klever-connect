/**
 * Transaction Status Watcher
 *
 * Polls the network until a given transaction reaches a terminal state
 * (success or failure), then exits with an appropriate status code.
 *
 * Use cases:
 * - Wait for a broadcast transaction to be confirmed before proceeding
 * - CI/CD scripts that need to verify a deployment transaction succeeded
 * - Automation pipelines that chain transactions sequentially
 *
 * Features:
 * - Configurable timeout and polling interval
 * - Exits 0 on success, 1 on failure or timeout
 * - Prints explorer URL on confirmation
 * - No private key needed (read-only)
 *
 * Usage:
 *   TX_HASH=<hash> node automation/transaction-watcher.js
 *   TX_HASH=<hash> TIMEOUT_MS=120000 node automation/transaction-watcher.js
 *
 * Environment variables:
 *   TX_HASH          - Transaction hash to watch (required)
 *   NETWORK          - Klever network (default: testnet)
 *   POLL_INTERVAL_MS - How often to check status in ms (default: 3000)
 *   TIMEOUT_MS       - Give up after this many ms (default: 60000)
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect'

const NETWORK = process.env.NETWORK || 'testnet'
const TX_HASH = process.env.TX_HASH
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '3000', 10)
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '60000', 10)

if (isNaN(POLL_INTERVAL_MS) || POLL_INTERVAL_MS <= 0) {
  console.error('Error: POLL_INTERVAL_MS must be a positive integer')
  process.exit(1)
}
if (isNaN(TIMEOUT_MS) || TIMEOUT_MS <= 0) {
  console.error('Error: TIMEOUT_MS must be a positive integer')
  process.exit(1)
}

// Terminal statuses returned by the Klever node
const SUCCESS_STATUSES = new Set(['success'])
const FAILURE_STATUSES = new Set(['failed', 'invalid'])

if (!TX_HASH) {
  console.error('Error: TX_HASH environment variable is required')
  console.error('Usage: TX_HASH=<hash> node automation/transaction-watcher.js')
  process.exit(1)
}

async function main() {
  const provider = new KleverProvider({
    network: NETWORK,
    // Disable caching so each poll fetches fresh data
    cache: { ttl: 0, maxSize: 0 },
    retry: { maxRetries: 2, backoff: 'linear' },
  })

  console.log(`Watching transaction: ${TX_HASH}`)
  console.log(`Network:  ${NETWORK}`)
  console.log(`Timeout:  ${TIMEOUT_MS / 1000}s`)
  console.log(`Interval: ${POLL_INTERVAL_MS / 1000}s`)
  console.log('')

  const startTime = Date.now()
  let attempt = 0

  while (true) {
    attempt++
    const elapsed = Date.now() - startTime

    if (elapsed >= TIMEOUT_MS) {
      console.error(`Timeout after ${TIMEOUT_MS / 1000}s — transaction not confirmed`)
      process.exit(1)
    }

    try {
      const tx = await provider.getTransaction(TX_HASH)
      const status = (tx.status ?? '').toLowerCase()

      process.stdout.write(
        `[${attempt}] Status: ${status || 'pending'} (${(elapsed / 1000).toFixed(1)}s elapsed)\r`,
      )

      if (SUCCESS_STATUSES.has(status)) {
        console.log(`\n✓ Transaction confirmed!`)
        console.log(`  Hash:    ${TX_HASH}`)
        console.log(`  Status:  ${status}`)
        console.log(`  Explorer: ${provider.getTransactionUrl(TX_HASH)}`)
        process.exit(0)
      }

      if (FAILURE_STATUSES.has(status)) {
        console.error(`\n✗ Transaction failed with status: ${status}`)
        console.error(`  Explorer: ${provider.getTransactionUrl(TX_HASH)}`)
        process.exit(1)
      }

      // Still pending — wait and retry
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    } catch (err) {
      const isNotFound = /not found|404/i.test(err.message)
      if (!isNotFound) {
        console.error(`\nFatal error: ${err.message}`)
        process.exit(1)
      }
      // Transaction may not be indexed yet — keep waiting
      process.stdout.write(`[${attempt}] Not found yet (${(elapsed / 1000).toFixed(1)}s elapsed)\r`)
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
