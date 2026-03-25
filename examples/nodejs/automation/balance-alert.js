/**
 * Balance Alert Monitor
 *
 * Watches one or more addresses and logs an alert whenever a balance
 * crosses a configured threshold (up or down).
 *
 * Use cases:
 * - Notify when a hot wallet runs low and needs a top-up
 * - Alert when a payment address receives funds above a threshold
 * - Monitor multiple operational addresses from a single script
 *
 * Features:
 * - Polls at a configurable interval (no private key needed)
 * - Tracks previous balance to detect changes
 * - Emits "low" and "received" alerts via winston
 * - Graceful shutdown
 *
 * Usage:
 *   node automation/balance-alert.js
 *   WATCH_ADDRESSES=klv1...,klv1... node automation/balance-alert.js
 *
 * Environment variables:
 *   NETWORK             - Klever network (default: testnet)
 *   WATCH_ADDRESSES     - Comma-separated list of addresses to watch (required)
 *   LOW_THRESHOLD_KLV   - Alert when balance drops below this value in KLV (default: 10)
 *   POLL_INTERVAL_MS    - Polling interval in milliseconds (default: 15000)
 */

import 'dotenv/config'
import { KleverProvider, formatKLV, parseKLV, isValidAddress } from '@klever/connect'
import winston from 'winston'

// ─── Logger ───────────────────────────────────────────────────────────────────

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
      return `${timestamp} [${level}] ${message}${metaStr}`
    }),
  ),
  transports: [new winston.transports.Console()],
})

// ─── Config ───────────────────────────────────────────────────────────────────

const NETWORK = process.env.NETWORK || 'testnet'
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '15000', 10)
const LOW_THRESHOLD_KLV_STR = process.env.LOW_THRESHOLD_KLV || '10'
const LOW_THRESHOLD_KLV = parseFloat(LOW_THRESHOLD_KLV_STR)
const LOW_THRESHOLD_RAW = parseKLV(LOW_THRESHOLD_KLV_STR)

if (isNaN(POLL_INTERVAL_MS) || POLL_INTERVAL_MS <= 0) {
  logger.error('POLL_INTERVAL_MS must be a positive integer')
  process.exit(1)
}
if (isNaN(LOW_THRESHOLD_KLV) || LOW_THRESHOLD_KLV <= 0) {
  logger.error('LOW_THRESHOLD_KLV must be a positive number')
  process.exit(1)
}

const rawAddresses = (process.env.WATCH_ADDRESSES || '')
  .split(',')
  .map((a) => a.trim())
  .filter(Boolean)

if (rawAddresses.length === 0) {
  logger.error('WATCH_ADDRESSES is required. Provide a comma-separated list of Klever addresses.')
  process.exit(1)
}

const invalid = rawAddresses.filter((a) => !isValidAddress(a))
if (invalid.length > 0) {
  logger.error(`Invalid addresses: ${invalid.join(', ')}`)
  process.exit(1)
}

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {Map<string, bigint>} address → last known balance */
const lastBalances = new Map()

/** @type {Set<string>} addresses currently below the low-balance threshold */
const lowBalanceAlerted = new Set()

// ─── Alert handlers ───────────────────────────────────────────────────────────

function onLowBalance(address, balance) {
  logger.warn('LOW BALANCE ALERT', {
    address,
    balance: formatKLV(balance),
    threshold: `${LOW_THRESHOLD_KLV} KLV`,
  })
  // TODO: integrate with your alerting system here
  // e.g. send a Slack message, PagerDuty alert, email, etc.
}

function onBalanceIncreased(address, previous, current) {
  const delta = current - previous
  logger.info('Balance increased', {
    address,
    previous: formatKLV(previous),
    current: formatKLV(current),
    delta: formatKLV(delta),
  })
}

function onBalanceDecreased(address, previous, current) {
  const delta = previous - current
  logger.info('Balance decreased', {
    address,
    previous: formatKLV(previous),
    current: formatKLV(current),
    delta: `-${formatKLV(delta)}`,
  })
}

// ─── Poll logic ───────────────────────────────────────────────────────────────

async function pollAddresses(provider) {
  for (const address of rawAddresses) {
    try {
      const balance = await provider.getBalance(address)
      const previous = lastBalances.get(address)

      if (previous !== undefined && balance !== previous) {
        if (balance > previous) {
          onBalanceIncreased(address, previous, balance)
        } else {
          onBalanceDecreased(address, previous, balance)
        }
      }

      if (balance < LOW_THRESHOLD_RAW) {
        if (!lowBalanceAlerted.has(address)) {
          onLowBalance(address, balance)
          lowBalanceAlerted.add(address)
        }
      } else {
        lowBalanceAlerted.delete(address)
      }

      lastBalances.set(address, balance)
    } catch (err) {
      logger.error('Failed to fetch balance', { address, error: err.message })
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const provider = new KleverProvider({
    network: NETWORK,
    retry: { maxRetries: 3, backoff: 'exponential' },
  })

  logger.info('Balance alert monitor started', {
    network: NETWORK,
    watching: rawAddresses,
    lowThreshold: `${LOW_THRESHOLD_KLV} KLV`,
    interval: `${POLL_INTERVAL_MS / 1000}s`,
  })

  // Fetch initial balances without alerting
  for (const address of rawAddresses) {
    try {
      const balance = await provider.getBalance(address)
      lastBalances.set(address, balance)
      logger.info('Initial balance', { address, balance: formatKLV(balance) })
    } catch (err) {
      logger.warn('Could not fetch initial balance', { address, error: err.message })
    }
  }

  const intervalId = setInterval(
    () =>
      pollAddresses(provider).catch((err) => logger.error('Poll error', { error: err.message })),
    POLL_INTERVAL_MS,
  )

  // Graceful shutdown
  function shutdown(signal) {
    logger.info(`Received ${signal}, stopping...`)
    clearInterval(intervalId)
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  logger.error('Fatal error', { error: err.message })
  process.exit(1)
})
