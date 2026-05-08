/**
 * Example: block-monitor (Flow 53)
 *
 * A small class-based block monitor that polls `provider.getBlockNumber()`,
 * fetches each new block via `provider.getBlock(...)`, and emits typed events.
 * Includes a "slow block" alert that fires when more than
 * `slowBlockThresholdMs` elapses without a new block.
 *
 * Why a class + EventEmitter
 * --------------------------
 * Real applications (alerts, dashboards, indexers) need to register multiple
 * listeners and detach cleanly on shutdown. Wrapping the poll loop in a class
 * with `start()` / `stop()` and node's built-in `EventEmitter` makes that
 * idiomatic without bringing in a third-party dep.
 *
 * Salvaged from `_legacy/nodejs/monitoring/block-monitor.js` (rewritten in TS).
 */

import 'node:process'
import { EventEmitter } from 'node:events'

import { KleverProvider } from '@klever/connect'

interface BlockMonitorEvents {
  block: [{ blockNumber: number; hash?: string; timestamp: number }]
  slowBlock: [{ sinceMs: number; lastBlockNumber: number }]
  error: [Error]
  stopped: []
}

class BlockMonitor extends EventEmitter {
  private timer: NodeJS.Timeout | null = null
  private lastBlockNumber: number | null = null
  private lastBlockObservedAt: number = Date.now()

  constructor(
    private readonly provider: KleverProvider,
    private readonly pollIntervalMs: number,
    private readonly slowBlockThresholdMs: number,
  ) {
    super()
  }

  start(): void {
    if (this.timer) return
    this.lastBlockObservedAt = Date.now()
    const tick = (): void => {
      this.poll().catch((err: unknown) =>
        this.emit('error', err instanceof Error ? err : new Error(String(err))),
      )
    }
    tick() // fire immediately so the first observation isn't delayed
    this.timer = setInterval(tick, this.pollIntervalMs)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.emit('stopped')
    }
  }

  private async poll(): Promise<void> {
    const head = await this.provider.getBlockNumber()
    const now = Date.now()
    if (this.lastBlockNumber !== null && head <= this.lastBlockNumber) {
      // No new block since last tick — check the slow-block threshold.
      if (now - this.lastBlockObservedAt > this.slowBlockThresholdMs) {
        this.emit('slowBlock', {
          sinceMs: now - this.lastBlockObservedAt,
          lastBlockNumber: this.lastBlockNumber,
        })
      }
      return
    }
    // We jumped forward by 1 or more blocks. Walk each new height.
    const startAt = this.lastBlockNumber === null ? head : this.lastBlockNumber + 1
    for (let h = startAt; h <= head; h++) {
      try {
        const block = (await this.provider.getBlock(h)) as
          | { hash?: string; timestamp?: number }
          | null
        this.emit('block', {
          blockNumber: h,
          hash: block?.hash,
          timestamp: block?.timestamp ?? now,
        })
      } catch (err) {
        this.emit('error', err instanceof Error ? err : new Error(String(err)))
      }
    }
    this.lastBlockNumber = head
    this.lastBlockObservedAt = now
  }

  // Typed forwarder for clarity. Vanilla EventEmitter accepts any names; this
  // wraps the API in a slightly more discoverable shape for our consumers.
  override on<K extends keyof BlockMonitorEvents>(
    event: K,
    listener: (...args: BlockMonitorEvents[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void)
  }
}

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const POLL_INTERVAL_MS = Number(process.env['POLL_INTERVAL_MS'] ?? '4000')
const SLOW_THRESHOLD_MS = Number(process.env['SLOW_BLOCK_THRESHOLD_MS'] ?? '30000')
const MAX_BLOCKS = Number(process.env['MAX_BLOCKS'] ?? '5')

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  const monitor = new BlockMonitor(provider, POLL_INTERVAL_MS, SLOW_THRESHOLD_MS)

  let observed = 0
  monitor.on('block', ({ blockNumber, hash, timestamp }) => {
    observed++
    const ts = new Date(timestamp).toISOString()
    console.log(`[block] #${blockNumber} hash=${hash ?? '<unknown>'} at ${ts}`)
    if (MAX_BLOCKS > 0 && observed >= MAX_BLOCKS) {
      console.log(`Observed ${observed} blocks — stopping.`)
      monitor.stop()
    }
  })
  monitor.on('slowBlock', ({ sinceMs, lastBlockNumber }) => {
    console.warn(
      `[slow-block] no new block for ${sinceMs}ms since #${lastBlockNumber}.`,
    )
  })
  monitor.on('error', (err) => {
    console.error(`[error] ${err.message}`)
  })
  monitor.on('stopped', () => {
    console.log('Monitor stopped.')
  })

  console.log(`Starting BlockMonitor on ${NETWORK} (poll=${POLL_INTERVAL_MS}ms)`)
  monitor.start()

  // Graceful shutdown.
  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.once(sig, () => {
      console.log(`Received ${sig} — stopping monitor.`)
      monitor.stop()
      process.exit(0)
    })
  }
}

main().catch((err) => {
  console.error('block-monitor failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
