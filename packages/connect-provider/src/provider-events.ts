import type { Network } from './types'
import type { ProviderEventMap, WsEventMessage } from './types/types'
import type { TypedEventEmitter } from './event-emitter'

const BLOCK_POLL_INTERVAL_MS = 3_000
const RECONNECT_BASE_DELAY_MS = 1_000
const RECONNECT_MAX_DELAY_MS = 30_000
const RECONNECT_MAX_ATTEMPTS = 5

const WS_EVENT_TYPES = ['blocks', 'transactions', 'accounts', 'user_transactions'] as const
type WsEventType = (typeof WS_EVENT_TYPES)[number]

const WS_TYPE_TO_PROVIDER_EVENT: Partial<Record<WsEventType, keyof ProviderEventMap>> = {
  blocks: 'block',
  transactions: 'pending',
} as const

type BlockPoller = {
  stop: () => void
}

function createBlockPoller(
  fetchBlockNumber: () => Promise<number>,
  onBlock: (blockNumber: number) => void,
  onError: (err: Error) => void,
): BlockPoller {
  let lastSeen = -1
  let stopped = false

  const tick = async (): Promise<void> => {
    if (stopped) return
    try {
      const num = await fetchBlockNumber()
      if (num !== lastSeen) {
        lastSeen = num
        onBlock(num)
      }
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const id = setInterval(() => {
    void tick()
  }, BLOCK_POLL_INTERVAL_MS)

  // Kick off immediately
  void tick()

  return {
    stop: () => {
      stopped = true
      clearInterval(id)
    },
  }
}

// The WebSocket server expects an initial subscription message
// at /subscribe route with this exact format (routes.go: subscribeRequest).
// Field name is "subscribed_types", not "types".
function buildSubscribeMessage(addresses: string[]): string {
  return JSON.stringify({
    addresses,
    subscribed_types: [...WS_EVENT_TYPES],
  })
}

/**
 * Manages the real-time event connection (WebSocket or polling fallback) for
 * a given Klever network.
 *
 * Consumers interact via the {@link TypedEventEmitter} that is passed in at
 * construction time — this class simply drives it with live data.
 *
 * @example
 * ```typescript
 * const manager = new KleverEventManager(
 *   network,
 *   emitter,
 *   () => provider.getBlockNumber(),
 *   debug,
 * )
 * manager.connect()
 * // ...
 * manager.dispose()
 * ```
 */
export class KleverEventManager {
  private readonly _network: Network
  private readonly _emitter: TypedEventEmitter<ProviderEventMap>
  private readonly _fetchBlockNumber: () => Promise<number>
  private readonly _debug: boolean

  private _ws: WebSocket | null = null
  private _wsConnected = false
  private _wsAvailable: boolean
  private _reconnectAttempts = 0
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _poller: BlockPoller | null = null
  private _disposed = false

  constructor(
    network: Network,
    emitter: TypedEventEmitter<ProviderEventMap>,
    fetchBlockNumber: () => Promise<number>,
    debug = false,
  ) {
    this._network = network
    this._emitter = emitter
    this._fetchBlockNumber = fetchBlockNumber
    this._debug = debug
    this._wsAvailable = typeof globalThis.WebSocket !== 'undefined'
  }

  /**
   * Open the connection.  If WebSocket is available and the network has a `ws`
   * URL, a WebSocket subscription is established.  Otherwise HTTP polling is
   * used as a fallback.
   */
  connect(): void {
    if (this._disposed) return
    // Guard: already have an active WebSocket or polling is running
    if (this._ws !== null || this._poller !== null) return

    const wsUrl = this._network.config.ws

    if (this._wsAvailable && wsUrl) {
      this._log(`Connecting WebSocket to ${wsUrl}`)
      this._connectWs(wsUrl)
    } else {
      this._log('WebSocket unavailable — starting block polling fallback')
      this._startPolling()
    }
  }

  /**
   * Close the connection and clean up all timers.  After calling this the
   * manager must not be reused — create a fresh instance instead.
   */
  dispose(): void {
    if (this._disposed) return
    this._disposed = true
    this._log('Disposing KleverEventManager')
    this._teardown()
  }

  /** Whether the WebSocket connection is currently open */
  get isConnected(): boolean {
    return this._wsConnected
  }

  /** Whether the manager is using polling (as opposed to WebSocket) */
  get isPolling(): boolean {
    return this._poller !== null
  }

  private _connectWs(url: string): void {
    if (this._disposed) return

    try {
      const ws = new globalThis.WebSocket(url)
      this._ws = ws

      ws.onopen = () => {
        if (this._disposed) {
          ws.close()
          return
        }
        this._wsConnected = true
        this._reconnectAttempts = 0
        this._log('WebSocket connected')

        // Send the initial subscription message.
        ws.send(buildSubscribeMessage([]))

        this._emitter.emit('connect', undefined)
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        this._handleWsMessage(event.data)
      }

      ws.onerror = (event: Event) => {
        this._log(`WebSocket error: ${event.type}`)
        // ErrorEvent is a browser-only global; guard against it being absent in
        // Node.js environments (e.g. during tests or server-side rendering).
        const errorEventMessage =
          typeof ErrorEvent !== 'undefined' && event instanceof ErrorEvent
            ? event.message
            : undefined
        this._emitter.emit('error', {
          code: 'WS_ERROR',
          message: 'WebSocket connection error',
          originalError: errorEventMessage !== undefined ? new Error(errorEventMessage) : undefined,
        })

        // Node.js 22+ native WebSocket does not always fire `onclose` after
        // `onerror` on a failed connection attempt (unlike browsers).  When the
        // connection was never established, trigger the reconnect logic here to
        // avoid getting stuck with no polling fallback.
        if (!this._wsConnected && !this._disposed) {
          this._ws = null
          this._scheduleReconnect(url)
        }
      }

      ws.onclose = (event: CloseEvent) => {
        // Guard: if onerror already cleaned up (Node.js behaviour), skip
        if (this._ws !== ws) return
        this._ws = null
        this._wsConnected = false
        this._log(`WebSocket closed: code=${event.code} reason=${event.reason}`)

        if (!this._disposed) {
          this._emitter.emit('disconnect', undefined)
          this._scheduleReconnect(url)
        }
      }
    } catch (err) {
      this._log(`Failed to create WebSocket: ${String(err)}`)
      this._emitter.emit('error', {
        code: 'WS_INIT_FAILED',
        message: `Failed to create WebSocket: ${err instanceof Error ? err.message : String(err)}`,
        originalError: err instanceof Error ? err : undefined,
      })
      // Fall back to polling
      this._wsAvailable = false
      this._startPolling()
    }
  }

  private _handleWsMessage(raw: string): void {
    let parsed: WsEventMessage

    try {
      parsed = JSON.parse(raw) as WsEventMessage
    } catch {
      this._log(`Failed to parse WS message: ${raw}`)
      return
    }

    const providerEvent = WS_TYPE_TO_PROVIDER_EVENT[parsed.type as WsEventType]

    if (!providerEvent) {
      this._log(`Ignoring unknown WS event type: ${parsed.type}`)
      return
    }

    if (providerEvent === 'block') {
      const blockData = parsed.data as Record<string, unknown> | undefined
      this._emitter.emit('block', {
        blockNumber: (blockData?.['nonce'] as number | undefined) ?? 0,
        hash: (blockData?.['hash'] as string | undefined) ?? parsed.hash ?? '',
        timestamp: (blockData?.['timestamp'] as number | undefined) ?? Date.now(),
      })
      return
    }

    if (providerEvent === 'pending') {
      const txData = parsed.data as Record<string, unknown> | undefined
      this._emitter.emit('pending', {
        hash: (txData?.['hash'] as string | undefined) ?? parsed.hash ?? '',
        from: (txData?.['sender'] as string | undefined) ?? parsed.address ?? '',
      })
    }
  }

  private _scheduleReconnect(url: string): void {
    if (this._disposed) return
    if (this._reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) {
      this._log(
        `Max reconnect attempts (${RECONNECT_MAX_ATTEMPTS}) reached — falling back to polling`,
      )
      this._startPolling()
      return
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, this._reconnectAttempts),
      RECONNECT_MAX_DELAY_MS,
    )
    this._reconnectAttempts++
    this._log(
      `Reconnecting in ${delay}ms (attempt ${this._reconnectAttempts}/${RECONNECT_MAX_ATTEMPTS})`,
    )

    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null
      if (!this._disposed) {
        this._connectWs(url)
      }
    }, delay)
  }

  private _startPolling(): void {
    if (this._poller) return // already polling
    this._log('Starting block polling fallback')
    this._poller = createBlockPoller(
      this._fetchBlockNumber,
      (blockNumber) => {
        this._emitter.emit('block', {
          blockNumber,
          hash: '',
          timestamp: Date.now(),
        })
      },
      (err) => {
        this._emitter.emit('error', {
          code: 'POLL_ERROR',
          message: `Block polling error: ${err.message}`,
          originalError: err,
        })
      },
    )
  }

  private _teardown(): void {
    if (this._reconnectTimer !== null) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }

    if (this._ws) {
      // Remove handlers before closing to prevent the onclose handler from
      // scheduling yet another reconnect during teardown.
      this._ws.onopen = null
      this._ws.onmessage = null
      this._ws.onerror = null
      this._ws.onclose = null
      if (this._ws.readyState === WebSocket.OPEN || this._ws.readyState === WebSocket.CONNECTING) {
        this._ws.close(1000, 'dispose')
      }
      this._ws = null
    }

    this._wsConnected = false

    if (this._poller) {
      this._poller.stop()
      this._poller = null
    }
  }
  private _log(message: string): void {
    if (this._debug) {
      console.log(`[KleverEventManager] ${message}`)
    }
  }
}
