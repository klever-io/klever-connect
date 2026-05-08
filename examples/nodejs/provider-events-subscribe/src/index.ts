/**
 * Example: provider-events-subscribe (Flow 55)
 *
 * Demonstrates the high-level provider event API:
 *
 *   provider.on('block', ...)     // new block produced
 *   provider.on('pending', ...)   // pending tx in mempool (when supported)
 *   provider.on('error', ...)     // connection / polling error
 *   provider.on('connect', ...)   // WS connection established
 *   provider.on('disconnect', ...)
 *
 * Networks differ in transport
 * ----------------------------
 * - `local` networks usually expose WebSocket endpoints; events arrive in
 *   real-time.
 * - `testnet` / `mainnet` rely on the SDK's internal polling fallback. You
 *   still call `provider.on('block', ...)` — the SDK transparently runs a
 *   poll loop for you.
 *
 * Always remember to:
 *   1. `provider.connect()` to start the underlying transport.
 *   2. `provider.removeAllListeners()` (or `off`) on shutdown to avoid leaks.
 */

import 'node:process'

import {
  KleverProvider,
  type ProviderEvent,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'
  | 'local'
const RUN_FOR_MS = Math.max(1_000, Number(process.env['RUN_FOR_MS'] ?? '20000'))

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })

  console.log(`Network:         ${NETWORK}`)
  console.log(`Run-for budget:  ${RUN_FOR_MS}ms`)
  if (NETWORK !== 'local') {
    console.log(
      'Note: testnet/mainnet do not expose WS — the SDK uses internal polling.',
    )
  }

  const onBlock = (data: { blockNumber: number; hash?: string }): void => {
    console.log(`[block] #${data.blockNumber} ${data.hash ?? ''}`.trim())
  }
  const onPending = (data: { hash: string }): void => {
    console.log(`[pending] ${data.hash}`)
  }
  const onError = (e: { message?: string; code?: string | number } | ProviderEvent): void => {
    const msg = (e as { message?: string }).message ?? String(e)
    console.error(`[provider-error] ${msg}`)
  }
  const onConnect = (): void => console.log('[connect]')
  const onDisconnect = (): void => console.log('[disconnect]')

  provider.on('block', onBlock)
  provider.on('pending', onPending)
  provider.on('error', onError)
  provider.on('connect', onConnect)
  provider.on('disconnect', onDisconnect)

  // The SDK's `connect()` is what activates the underlying transport (WS
  // connection or polling loop). Without it, the listeners stay silent.
  if (typeof (provider as unknown as { connect?: () => void }).connect === 'function') {
    ;(provider as unknown as { connect: () => void }).connect()
  }

  setTimeout(() => {
    console.log('Run-for budget exhausted — cleaning up listeners.')
    provider.removeAllListeners()
    if (typeof (provider as unknown as { disconnect?: () => void }).disconnect === 'function') {
      ;(provider as unknown as { disconnect: () => void }).disconnect()
    }
    process.exit(0)
  }, RUN_FOR_MS)

  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.once(sig, () => {
      console.log(`Received ${sig} — shutting down.`)
      provider.removeAllListeners()
      process.exit(0)
    })
  }
}

main().catch((err) => {
  console.error(
    'provider-events-subscribe failed:',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
})
