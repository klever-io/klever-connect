/**
 * Block Monitor
 *
 * Demonstrates how to monitor the Klever blockchain for new blocks,
 * using polling and Node.js EventEmitter for a reactive architecture.
 *
 * Features:
 * - Polls for new blocks at a configurable interval
 * - Emits typed events for new blocks
 * - Configurable alert thresholds (e.g., block time too slow)
 * - Structured logging with winston
 * - Graceful shutdown
 *
 * Usage:
 *   node monitoring/block-monitor.js
 *
 * Environment variables:
 *   NETWORK          - Klever network (default: testnet)
 *   POLL_INTERVAL_MS - Polling interval in milliseconds (default: 4000)
 *   LOG_LEVEL        - Winston log level (default: info)
 */

import 'dotenv/config'
import { EventEmitter } from 'events'
import { KleverProvider } from '@klever/connect'
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

// ─── Block Monitor class ──────────────────────────────────────────────────────

class BlockMonitor extends EventEmitter {
  constructor(provider, options = {}) {
    super()
    this.provider = provider
    this.pollInterval = options.pollInterval ?? 4000
    this.lastBlockNumber = null
    this.lastBlockTime = null
    this._intervalId = null
    this._running = false
  }

  async start() {
    if (this._running) return
    this._running = true

    logger.info('Block monitor starting...')

    // Initialize from current block
    this.lastBlockNumber = await this.provider.getBlockNumber()
    this.lastBlockTime = Date.now()
    logger.info(`Starting from block #${this.lastBlockNumber}`)

    this._intervalId = setInterval(() => this._poll(), this.pollInterval)
    this.emit('started', { blockNumber: this.lastBlockNumber })
  }

  async stop() {
    if (!this._running) return
    this._running = false

    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }

    logger.info('Block monitor stopped')
    this.emit('stopped')
  }

  async _poll() {
    try {
      const currentBlock = await this.provider.getBlockNumber()

      if (currentBlock <= this.lastBlockNumber) {
        return // No new block yet
      }

      // Process all new blocks since last poll
      for (let n = this.lastBlockNumber + 1; n <= currentBlock; n++) {
        const block = await this.provider.getBlock(n)
        const now = Date.now()
        const blockTime = this.lastBlockTime ? (now - this.lastBlockTime) / 1000 : null

        const blockInfo = {
          number: n,
          hash: block.hash,
          txCount: block.transactions?.length ?? 0,
          blockTimeSec: blockTime?.toFixed(2),
        }

        logger.info(`New block #${n}`, blockInfo)
        this.emit('block', { ...blockInfo, raw: block })

        // Alert on slow blocks (> 10 seconds)
        if (blockTime && blockTime > 10) {
          logger.warn(`Slow block detected`, { blockNumber: n, blockTimeSec: blockTime.toFixed(2) })
          this.emit('slowBlock', { blockNumber: n, blockTimeSec: blockTime })
        }

        this.lastBlockTime = now
      }

      this.lastBlockNumber = currentBlock
    } catch (err) {
      logger.error('Poll error', { error: err.message })
      this.emit('error', err)
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const NETWORK = process.env.NETWORK || 'testnet'
  const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '4000', 10)

  const provider = new KleverProvider({
    network: NETWORK,
    retry: { maxRetries: 3, backoff: 'exponential' },
  })

  const monitor = new BlockMonitor(provider, { pollInterval: POLL_INTERVAL_MS })

  // Event handlers
  monitor.on('block', ({ number, txCount, blockTimeSec }) => {
    // Custom handler: could send to a metrics system, database, or alert service
    if (txCount > 0) {
      logger.info(`Block #${number} has ${txCount} transaction(s)`)
    }
  })

  monitor.on('slowBlock', ({ blockNumber, blockTimeSec }) => {
    // Example: send an alert (Slack, PagerDuty, etc.)
    logger.warn(`ALERT: Block #${blockNumber} took ${blockTimeSec}s (threshold: 10s)`)
  })

  monitor.on('error', (err) => {
    logger.error('Monitor error', { error: err.message })
  })

  await monitor.start()

  logger.info(`Monitoring ${NETWORK} for new blocks every ${POLL_INTERVAL_MS}ms`)
  logger.info('Press Ctrl+C to stop')

  // Graceful shutdown
  async function shutdown(signal) {
    logger.info(`Received ${signal}, stopping monitor...`)
    await monitor.stop()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  logger.error('Fatal error', { error: err.message })
  process.exit(1)
})
