import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TypedEventEmitter } from '../event-emitter'
import { KleverEventManager } from '../provider-events'
import type { ProviderEventMap } from '../types/types'
import type { Network } from '../types'

// ---------------------------------------------------------------------------
// Minimal Network fixture
// ---------------------------------------------------------------------------

function makeNetwork(ws?: string): Network {
  return {
    name: 'testnet',
    chainId: '109',
    config: {
      api: 'https://api.testnet.klever.org',
      node: 'https://node.testnet.klever.org',
      ...(ws !== undefined ? { ws } : {}),
    },
    isTestnet: true,
    nativeCurrency: { name: 'Klever', symbol: 'KLV', decimals: 6 },
  }
}

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

type MockWsHandler = (event: { data: string }) => void
type MockWsCloseHandler = (event: { code: number; reason: string }) => void
type MockWsErrorHandler = (event: Event) => void
type MockWsOpenHandler = () => void

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen: MockWsOpenHandler | null = null
  onmessage: MockWsHandler | null = null
  onerror: MockWsErrorHandler | null = null
  onclose: MockWsCloseHandler | null = null

  readonly sentMessages: string[] = []

  send(data: string): void {
    this.sentMessages.push(data)
  }

  close(code = 1000, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({ code, reason })
  }

  /** Simulate server accepting the connection */
  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  /** Simulate receiving a message from the server */
  simulateMessage(data: string): void {
    this.onmessage?.({ data })
  }

  /** Simulate a connection error */
  simulateError(): void {
    this.onerror?.(new Event('error'))
  }
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

let mockWsInstance: MockWebSocket | null = null

function installMockWebSocket(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).WebSocket = class extends MockWebSocket {
    constructor(_url: string) {
      super()
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      mockWsInstance = this
    }
  }
}

function uninstallMockWebSocket(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).WebSocket
  mockWsInstance = null
}

function makeManager(
  network: Network,
  debug = false,
): {
  manager: KleverEventManager
  emitter: TypedEventEmitter<ProviderEventMap>
  fetchBlockNumber: ReturnType<typeof vi.fn>
} {
  const emitter = new TypedEventEmitter<ProviderEventMap>()
  const fetchBlockNumber = vi.fn().mockResolvedValue(42)
  const manager = new KleverEventManager(network, emitter, fetchBlockNumber, debug)
  return { manager, emitter, fetchBlockNumber }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('KleverEventManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    installMockWebSocket()
  })

  afterEach(() => {
    vi.useRealTimers()
    uninstallMockWebSocket()
  })

  describe('WebSocket path', () => {
    it('connects via WebSocket when ws URL is present', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      expect(mockWsInstance).not.toBeNull()
    })

    it('sends subscribe message on open', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      expect(mockWsInstance?.sentMessages).toHaveLength(1)
      const msg = JSON.parse(mockWsInstance?.sentMessages[0] ?? '{}') as {
        addresses: string[]
        subscribed_types: string[]
      }
      expect(msg.addresses).toEqual([])
      expect(msg.subscribed_types).toContain('blocks')
      expect(msg.subscribed_types).toContain('transactions')
    })

    it('emits connect event on WebSocket open', () => {
      const { manager, emitter } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      const connectListener = vi.fn()
      emitter.on('connect', connectListener)

      manager.connect()
      mockWsInstance?.simulateOpen()

      expect(connectListener).toHaveBeenCalledOnce()
    })

    it('is connected after WebSocket open', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()

      expect(manager.isConnected).toBe(false)
      mockWsInstance?.simulateOpen()
      expect(manager.isConnected).toBe(true)
    })

    it('emits block event from blocks WS message', () => {
      const { manager, emitter } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      const blockListener = vi.fn()
      emitter.on('block', blockListener)

      manager.connect()
      mockWsInstance?.simulateOpen()
      mockWsInstance?.simulateMessage(
        JSON.stringify({
          type: 'blocks',
          address: '',
          hash: 'blockhash123',
          data: { nonce: 500, timestamp: 1700000000 },
        }),
      )

      expect(blockListener).toHaveBeenCalledOnce()
      expect(blockListener).toHaveBeenCalledWith({
        blockNumber: 500,
        hash: 'blockhash123',
        timestamp: 1700000000,
      })
    })

    it('emits pending event from transactions WS message', () => {
      const { manager, emitter } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      const pendingListener = vi.fn()
      emitter.on('pending', pendingListener)

      manager.connect()
      mockWsInstance?.simulateOpen()
      mockWsInstance?.simulateMessage(
        JSON.stringify({
          type: 'transactions',
          address: 'klv1sender',
          hash: 'txhash456',
          data: { sender: 'klv1abc' },
        }),
      )

      expect(pendingListener).toHaveBeenCalledOnce()
      expect(pendingListener).toHaveBeenCalledWith({
        hash: 'txhash456',
        from: 'klv1abc',
      })
    })

    it('ignores unknown WS event types', () => {
      const { manager, emitter } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      const blockListener = vi.fn()
      const pendingListener = vi.fn()
      emitter.on('block', blockListener)
      emitter.on('pending', pendingListener)

      manager.connect()
      mockWsInstance?.simulateOpen()
      mockWsInstance?.simulateMessage(
        JSON.stringify({ type: 'accounts', address: 'klv1x', hash: '', data: {} }),
      )

      expect(blockListener).not.toHaveBeenCalled()
      expect(pendingListener).not.toHaveBeenCalled()
    })

    it('emits error event on WS error', () => {
      const { manager, emitter } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      const errorListener = vi.fn()
      emitter.on('error', errorListener)

      manager.connect()
      mockWsInstance?.simulateOpen()
      mockWsInstance?.simulateError()

      expect(errorListener).toHaveBeenCalledOnce()
      expect(errorListener.mock.calls[0]?.[0]).toMatchObject({ code: 'WS_ERROR' })
    })

    it('emits disconnect event on WS close', () => {
      const { manager, emitter } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      const disconnectListener = vi.fn()
      emitter.on('disconnect', disconnectListener)

      manager.connect()
      mockWsInstance?.simulateOpen()
      mockWsInstance?.simulateError()
      // Simulating close after error
      mockWsInstance?.close(1006, 'abnormal')

      expect(disconnectListener).toHaveBeenCalledOnce()
    })

    it('is not connected after dispose', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      expect(manager.isConnected).toBe(true)
      manager.dispose()
      expect(manager.isConnected).toBe(false)
    })

    it('second connect() call is a no-op while connected', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      const firstInstance = mockWsInstance

      mockWsInstance?.simulateOpen()
      // Calling connect() again should not create a new WebSocket
      manager.connect()

      expect(mockWsInstance).toBe(firstInstance)
    })

    it('does not send application-level ping messages (gorilla handles keepalive at protocol level)', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      // Only the initial subscription message should have been sent
      vi.advanceTimersByTime(15_000)
      expect(mockWsInstance?.sentMessages).toHaveLength(1)
    })
  })

  describe('polling fallback path', () => {
    beforeEach(() => {
      uninstallMockWebSocket()
    })

    it('falls back to polling when WebSocket is unavailable', () => {
      const { manager, fetchBlockNumber } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      expect(manager.isPolling).toBe(true)
      expect(fetchBlockNumber).toHaveBeenCalledOnce() // immediate kick-off
    })

    it('emits block events via polling', async () => {
      const { manager, emitter, fetchBlockNumber } = makeManager(
        makeNetwork('wss://api.testnet.klever.org'),
      )
      const blockListener = vi.fn()
      emitter.on('block', blockListener)

      manager.connect()

      // The immediate tick() call is async; flush it then advance one interval
      await vi.advanceTimersByTimeAsync(3_000)

      expect(fetchBlockNumber).toHaveBeenCalled()
      expect(blockListener).toHaveBeenCalled()

      manager.dispose()
    })

    it('uses polling when network has no ws URL', () => {
      const { manager } = makeManager(makeNetwork(undefined))
      manager.connect()
      expect(manager.isPolling).toBe(true)
    })

    it('stops polling after dispose', async () => {
      const { manager, fetchBlockNumber } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      manager.dispose()

      // Clear call count after dispose
      fetchBlockNumber.mockClear()

      // Advance timers — no more calls expected
      await vi.runAllTimersAsync()
      expect(fetchBlockNumber).not.toHaveBeenCalled()
    })

    it('emits error event when fetchBlockNumber throws', async () => {
      const emitter = new TypedEventEmitter<ProviderEventMap>()
      const fetchBlockNumber = vi.fn().mockRejectedValue(new Error('network down'))
      const manager = new KleverEventManager(makeNetwork('wss://'), emitter, fetchBlockNumber)
      const errorListener = vi.fn()
      emitter.on('error', errorListener)

      manager.connect()
      // Flush the immediate async tick
      await vi.advanceTimersByTimeAsync(100)

      expect(errorListener).toHaveBeenCalledOnce()
      expect(errorListener.mock.calls[0]?.[0]).toMatchObject({ code: 'POLL_ERROR' })

      manager.dispose()
    })
  })

  describe('reconnect backoff', () => {
    it('schedules reconnect after WebSocket close', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      const firstInstance = mockWsInstance

      // Close the WebSocket — triggers reconnect scheduling
      mockWsInstance?.close(1006, 'abnormal')

      // Before advancing timers, no new WebSocket should exist
      expect(mockWsInstance).toBe(firstInstance)

      // Advance past the first backoff delay (1_000 ms base)
      vi.advanceTimersByTime(1_100)

      // A new WebSocket instance should have been created
      expect(mockWsInstance).not.toBe(firstInstance)
      expect(mockWsInstance).not.toBeNull()

      manager.dispose()
    })

    it('uses exponential backoff for successive reconnects', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      // First disconnect → attempt 1 → delay = 1_000 * 2^0 = 1_000 ms
      mockWsInstance?.close(1006, '')
      vi.advanceTimersByTime(999)
      const afterFirstClose = mockWsInstance
      // Not yet reconnected
      vi.advanceTimersByTime(2)
      const afterFirstReconnect = mockWsInstance
      expect(afterFirstReconnect).not.toBe(afterFirstClose)

      // Second disconnect → attempt 2 → delay = 1_000 * 2^1 = 2_000 ms
      mockWsInstance?.close(1006, '')
      vi.advanceTimersByTime(1_999)
      const beforeSecondReconnect = mockWsInstance
      vi.advanceTimersByTime(2)
      const afterSecondReconnect = mockWsInstance
      // The second reconnect should have fired after ~2_000 ms
      expect(afterSecondReconnect).not.toBe(beforeSecondReconnect)

      manager.dispose()
    })

    it('falls back to polling after max reconnect attempts', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      // The backoff sequence is: 1s, 2s, 4s, 8s, 16s (5 attempts).
      // After all 5 scheduled reconnects fire and each new WS is closed,
      // the 6th close triggers the polling fallback.
      // We close + advance timers for the initial close plus each of the 5 retries:
      for (let attempt = 0; attempt <= 5; attempt++) {
        mockWsInstance?.close(1006, '')
        // Advance more than the max backoff cap (30_000 ms) to ensure all timers fire
        vi.advanceTimersByTime(30_100)
      }

      // After exhausting all reconnect attempts the manager falls back to polling
      expect(manager.isPolling).toBe(true)

      manager.dispose()
    })
  })

  describe('block polling deduplication', () => {
    beforeEach(() => {
      uninstallMockWebSocket()
    })

    it('does not emit the same block number twice', async () => {
      const emitter = new TypedEventEmitter<ProviderEventMap>()
      // fetchBlockNumber always returns the same block
      const fetchBlockNumber = vi.fn().mockResolvedValue(100)
      const manager = new KleverEventManager(makeNetwork(undefined), emitter, fetchBlockNumber)
      const blockListener = vi.fn()
      emitter.on('block', blockListener)

      manager.connect()

      // First tick fires immediately
      await vi.advanceTimersByTimeAsync(0)
      // Advance one poll interval — same block number returned
      await vi.advanceTimersByTimeAsync(3_000)

      // Block 100 should have been emitted only once despite two fetch calls
      const callsWithBlock100 = blockListener.mock.calls.filter(
        (call) => (call[0] as { blockNumber: number }).blockNumber === 100,
      )
      expect(callsWithBlock100).toHaveLength(1)

      manager.dispose()
    })

    it('emits a new event when the block number advances', async () => {
      const emitter = new TypedEventEmitter<ProviderEventMap>()
      let callCount = 0
      const fetchBlockNumber = vi.fn().mockImplementation(async () => {
        callCount++
        return callCount <= 1 ? 100 : 101
      })
      const manager = new KleverEventManager(makeNetwork(undefined), emitter, fetchBlockNumber)
      const blockListener = vi.fn()
      emitter.on('block', blockListener)

      manager.connect()

      // First immediate tick → block 100
      await vi.advanceTimersByTimeAsync(0)
      // Second tick → block 101
      await vi.advanceTimersByTimeAsync(3_000)

      expect(blockListener).toHaveBeenCalledTimes(2)
      expect((blockListener.mock.calls[0]?.[0] as { blockNumber: number }).blockNumber).toBe(100)
      expect((blockListener.mock.calls[1]?.[0] as { blockNumber: number }).blockNumber).toBe(101)

      manager.dispose()
    })
  })

  describe('dispose safety', () => {
    it('dispose is idempotent', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.connect()
      mockWsInstance?.simulateOpen()

      // Call dispose twice — should not throw
      expect(() => {
        manager.dispose()
        manager.dispose()
      }).not.toThrow()
    })

    it('connect after dispose is a no-op', () => {
      const { manager } = makeManager(makeNetwork('wss://api.testnet.klever.org'))
      manager.dispose()

      // Should not throw or create a WebSocket
      expect(() => manager.connect()).not.toThrow()
      expect(mockWsInstance).toBeNull()
    })
  })
})
