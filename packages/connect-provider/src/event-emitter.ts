/** Maximum listeners per event before a warning is emitted to the console */
const MAX_LISTENERS_WARN = 10

type Listener<T> = (data: T) => void

interface ListenerEntry<T> {
  listener: Listener<T>
  /** When true, the entry is removed after the first invocation */
  once: boolean
}

// Alias for the union type stored in the Map to avoid repeating it at every
// call site. The per-key narrowing is done in the typed accessor below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntry<TEventMap> = Array<ListenerEntry<TEventMap[keyof TEventMap] & any>>

/**
 * Generic typed event emitter.
 *
 * @typeParam TEventMap - A record mapping event name strings to their payload
 *   types.  Use `void` for events that carry no data.
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   block: { nonce: number; hash: string }
 *   error: Error
 *   connect: void
 * }
 *
 * const emitter = new TypedEventEmitter<MyEvents>()
 * emitter.on('block', ({ nonce }) => console.log('block', nonce))
 * emitter.emit('block', { nonce: 1, hash: '0xabc' })
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TypedEventEmitter<TEventMap extends Record<string, any>> {
  private readonly _listeners = new Map<keyof TEventMap, AnyEntry<TEventMap>>()
  /**
   * Add a persistent listener for `event`.
   * The listener will be called every time the event is emitted.
   *
   * @param event - The event name
   * @param listener - Callback invoked with the event payload
   */
  on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    this._addListener(event, listener, false)
    return this
  }

  /**
   * Remove a previously registered listener for `event`.
   * If the listener is not found this is a no-op.
   *
   * @param event - The event name
   * @param listener - The exact callback reference that was passed to `on`/`once`
   */
  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    const entries = this._getEntries(event)
    if (!entries) return this

    const filtered = entries.filter((e) => e.listener !== listener)
    if (filtered.length === 0) {
      this._listeners.delete(event)
    } else {
      this._listeners.set(event, filtered)
    }

    return this
  }

  /**
   * Add a one-time listener for `event`.
   * The listener will be invoked at most once and then automatically removed.
   *
   * @param event - The event name
   * @param listener - Callback invoked with the event payload
   */
  once<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): this {
    this._addListener(event, listener, true)
    return this
  }

  /**
   * Remove all listeners for a specific event, or every listener across all
   * events when called without arguments.
   *
   * @param event - Optional event name.  When omitted all listeners are cleared.
   */
  removeAllListeners<K extends keyof TEventMap>(event?: K): this {
    if (event === undefined) {
      this._listeners.clear()
    } else {
      this._listeners.delete(event)
    }
    return this
  }

  /**
   * Return the number of listeners currently registered for `event`.
   *
   * @param event - The event name
   */
  getListenerCount<K extends keyof TEventMap>(event: K): number {
    return this._listeners.get(event)?.length ?? 0
  }

  /**
   * Return all event names that currently have at least one listener.
   */
  eventNames(): Array<keyof TEventMap> {
    return Array.from(this._listeners.keys())
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  /**
   * Dispatch `event` to all registered listeners.
   * One-time listeners are removed before invocation so that re-entrant
   * emissions do not call them twice.
   *
   * @param event - The event name
   * @param data - The payload forwarded to every listener
   */
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    const entries = this._getEntries(event)
    if (!entries || entries.length === 0) return

    // Snapshot to handle mutations during iteration
    const snapshot = entries.slice()

    // Remove once-listeners before calling them (handles re-entrant emits)
    const remaining = entries.filter((e) => !e.once)
    if (remaining.length !== entries.length) {
      if (remaining.length === 0) {
        this._listeners.delete(event)
      } else {
        this._listeners.set(event, remaining)
      }
    }

    for (const entry of snapshot) {
      entry.listener(data)
    }
  }

  /** Centralised typed accessor — the single place where the Map cast lives. */
  private _getEntries<K extends keyof TEventMap>(
    event: K,
  ): Array<ListenerEntry<TEventMap[K]>> | undefined {
    return this._listeners.get(event) as Array<ListenerEntry<TEventMap[K]>> | undefined
  }

  private _addListener<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    isOnce: boolean,
  ): void {
    let entries = this._getEntries(event)

    if (!entries) {
      entries = []
      this._listeners.set(event, entries)
    }

    entries.push({ listener, once: isOnce })

    if (entries.length > MAX_LISTENERS_WARN) {
      console.warn(
        `[TypedEventEmitter] Possible memory leak: ${entries.length} listeners registered for event "${String(event)}". ` +
          `Use removeAllListeners() to clean up unused subscriptions.`,
      )
    }
  }
}
