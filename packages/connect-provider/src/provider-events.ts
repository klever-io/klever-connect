import type { Network } from './types'
import type { ProviderEventMap, WsEventMessage } from './types/types'
import type { TypedEventEmitter } from './event-emitter'

const BLOCK_POLL_INTERVAL_MS = 3_000
const RECONNECT_BASE_DELAY_MS = 1_000
const RECONNECT_MAX_DELAY_MS = 30_000
const RECONNECT_MAX_ATTEMPTS = 5
const WS_CONNECT_TIMEOUT_MS = 15_000

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
  let timer: ReturnType<typeof setTimeout> | null = null

  const tick = async (): Promise<void> => {
    if (stopped) return
    try {
      const num = await fetchBlockNumber()
      if (!stopped && num !== lastSeen) {
        lastSeen = num
        onBlock(num)
      }
    } catch (err) {
      if (!stopped) onError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (!stopped) timer = setTimeout(() => void tick(), BLOCK_POLL_INTERVAL_MS)
    }
  }

  void tick()

  return {
    stop: () => {
      stopped = true
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
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
  private _wsConnectTimer: ReturnType<typeof setTimeout> | null = null
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
    // Guard: already have an active WebSocket, polling, or a pending reconnect
    if (this._ws !== null || this._poller !== null || this._reconnectTimer !== null) return

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

      this._wsConnectTimer = setTimeout(() => {
        this._wsConnectTimer = null
        if (!this._wsConnected && this._ws === ws) {
          this._log(`WebSocket connection timed out after ${WS_CONNECT_TIMEOUT_MS}ms`)
          ws.onopen = null
          ws.onerror = null
          ws.onclose = null
          ws.close()
          this._ws = null
          if (!this._disposed) this._scheduleReconnect(url)
        }
      }, WS_CONNECT_TIMEOUT_MS)

      ws.onopen = () => {
        if (this._wsConnectTimer !== null) {
          clearTimeout(this._wsConnectTimer)
          this._wsConnectTimer = null
        }
        if (this._disposed) {
          ws.close()
          return
        }
        this._wsConnected = true
        this._reconnectAttempts = 0
        this._log('WebSocket connected')

        // Send the initial subscription message.
        ws.send(buildSubscribeMessage([]))

        this._safeEmit('connect', undefined)
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        this._handleWsMessage(event.data)
      }

      ws.onerror = (event: Event) => {
        if (this._wsConnectTimer !== null) {
          clearTimeout(this._wsConnectTimer)
          this._wsConnectTimer = null
        }
        this._log(`WebSocket error: ${event.type}`)
        // ErrorEvent is a browser-only global; guard against it being absent in
        // Node.js environments (e.g. during tests or server-side rendering).
        const errorEventMessage =
          typeof ErrorEvent !== 'undefined' && event instanceof ErrorEvent
            ? event.message
            : undefined
        this._safeEmit('error', {
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
        if (this._wsConnectTimer !== null) {
          clearTimeout(this._wsConnectTimer)
          this._wsConnectTimer = null
        }
        // Guard: if onerror already cleaned up (Node.js behaviour), skip
        if (this._ws !== ws) return
        this._ws = null
        this._wsConnected = false
        this._log(`WebSocket closed: code=${event.code} reason=${event.reason}`)

        if (!this._disposed) {
          this._safeEmit('disconnect', undefined)
          this._scheduleReconnect(url)
        }
      }
    } catch (err) {
      this._log(`Failed to create WebSocket: ${String(err)}`)
      this._safeEmit('error', {
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

    if (parsed === null || typeof parsed !== 'object' || typeof parsed.type !== 'string') {
      this._log(`Dropping malformed WS frame: ${raw}`)
      return
    }

    const providerEvent = WS_TYPE_TO_PROVIDER_EVENT[parsed.type as WsEventType]

    if (!providerEvent) {
      this._log(`Ignoring unknown WS event type: ${parsed.type}`)
      return
    }

    if (providerEvent === 'block') {
      const blockData =
        typeof parsed.data === 'object' && parsed.data !== null
          ? (parsed.data as Record<string, unknown>)
          : undefined
      const blockNumber = blockData?.['nonce']

      if (typeof blockNumber !== 'number') {
        this._log(`Dropping malformed block frame: ${raw}`)
        return
      }

      const hash = blockData?.['hash'] ?? parsed.hash
      const timestamp = blockData?.['timestamp']

      this._safeEmit('block', {
        blockNumber,
        ...(typeof hash === 'string' && { hash }),
        ...(typeof timestamp === 'number' && { timestamp }),
      })
      return
    }

    if (providerEvent === 'pending') {
      const txData =
        typeof parsed.data === 'object' && parsed.data !== null
          ? (parsed.data as Record<string, unknown>)
          : undefined
      const txHash = txData?.['hash'] ?? parsed.hash
      const txFrom = txData?.['sender'] ?? parsed.address

      if (typeof txHash !== 'string' || typeof txFrom !== 'string') {
        this._log(`Dropping malformed pending frame: ${raw}`)
        return
      }

      this._safeEmit('pending', {
        hash: txHash,
        from: txFrom,
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
        this._safeEmit('block', { blockNumber })
      },
      (err) => {
        this._safeEmit('error', {
          code: 'POLL_ERROR',
          message: `Block polling error: ${err.message}`,
          originalError: err,
        })
      },
    )
    this._safeEmit('connect', undefined)
  }

  private _teardown(): void {
    if (this._wsConnectTimer !== null) {
      clearTimeout(this._wsConnectTimer)
      this._wsConnectTimer = null
    }

    if (this._reconnectTimer !== null) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }

    if (this._wsConnected || this._poller !== null) {
      this._safeEmit('disconnect', undefined)
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
  private _safeEmit<K extends keyof ProviderEventMap>(event: K, data: ProviderEventMap[K]): void {
    try {
      this._emitter.emit(event, data)
    } catch (err) {
      this._log(`Listener threw for event "${String(event)}": ${String(err)}`)
    }
  }

  private _log(message: string): void {
    if (this._debug) {
      console.log(`[KleverEventManager] ${message}`)
    }
  }
}
