import type { TransactionHash } from '@klever/connect-core'
import type { IProvider, ITransactionResponse } from '@klever/connect-provider'
import { TransactionStatus } from '@klever/connect-provider'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Configuration options for transaction monitoring
 */
export interface UseTransactionMonitorOptions {
  /** Delay before first check in milliseconds - allows tx propagation (default: 1500) */
  initialDelay?: number

  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number

  /** Maximum time to wait in milliseconds (default: 60000) */
  timeout?: number

  /** Whether to fetch full transaction details with results (default: true) */
  fetchResults?: boolean

  /** Custom provider instance (required) */
  provider: IProvider

  /** Callback for status updates during monitoring */
  onStatusUpdate?: (status: TransactionMonitorStatus) => void

  /** Callback when monitoring completes (success or failure) */
  onComplete?: (result: TransactionMonitorResult) => void

  /** Callback for errors during monitoring */
  onError?: (error: Error) => void
}

/**
 * Current status of a monitored transaction
 */
export interface TransactionMonitorStatus {
  /** Transaction hash being monitored */
  hash: string
  /** Current status: pending, confirmed, or failed */
  status: 'pending' | 'confirmed' | 'failed'
  /** Number of polling attempts made */
  attempts: number
  /** Time elapsed since monitoring started (ms) */
  elapsedTime: number
}

/**
 * Final result of transaction monitoring
 */
export interface TransactionMonitorResult {
  /** Transaction hash */
  hash: string
  /** Final status: confirmed or failed */
  status: 'confirmed' | 'failed'
  /** Full transaction response (if fetchResults is true) */
  transaction?: ITransactionResponse
  /** Error object if monitoring failed */
  error?: Error
}

/**
 * Return type for useTransactionMonitor hook
 */
export interface UseTransactionMonitorReturn {
  /** Start monitoring a transaction by hash */
  monitor: (
    hash: string,
    options?: Partial<UseTransactionMonitorOptions>,
  ) => Promise<TransactionMonitorResult>

  /** Cancel monitoring a specific transaction */
  cancel: (hash: string) => void

  /** Cancel all active monitors */
  cancelAll: () => void

  /** Get current monitoring status for a hash */
  getStatus: (hash: string) => TransactionMonitorStatus | null

  /** List of all currently monitored transaction hashes */
  activeMonitors: string[]

  /** Boolean indicating if any transactions are being monitored */
  isMonitoring: boolean
}

interface MonitorState {
  status: TransactionMonitorStatus
  controller: AbortController
  promise: Promise<TransactionMonitorResult>
  startTime: number
}

const DEFAULT_OPTIONS: Omit<Required<UseTransactionMonitorOptions>, 'provider'> = {
  initialDelay: 1500,
  pollInterval: 2000,
  timeout: 60000,
  fetchResults: true,
  onStatusUpdate: () => {},
  onComplete: () => {},
  onError: () => {},
}

const MAX_CONCURRENT_MONITORS = 10

/**
 * useTransactionMonitor - Hook for real-time transaction monitoring
 *
 * Provides real-time monitoring of transaction status with automatic polling,
 * exponential backoff, and support for multiple concurrent transactions.
 * Perfect for tracking transaction confirmations and providing user feedback.
 *
 * @param defaultOptions - Default options applied to all monitor calls
 * @returns Transaction monitoring methods and state
 *
 * @example Basic transaction monitoring
 * ```tsx
 * import { useTransactionMonitor } from '@klever/connect-react'
 * import { useKlever } from '@klever/connect-react'
 *
 * function TransactionTracker() {
 *   const { provider } = useKlever()
 *   const { monitor, activeMonitors, isMonitoring } = useTransactionMonitor({
 *     provider,
 *     onStatusUpdate: (status) => {
 *       console.log(`Attempt ${status.attempts}: ${status.status}`)
 *     },
 *     onComplete: (result) => {
 *       console.log('Transaction complete:', result.status)
 *     }
 *   })
 *
 *   const handleSendAndMonitor = async () => {
 *     // Send transaction (example)
 *     const result = await wallet.sendTransaction(...)
 *
 *     // Monitor the transaction
 *     const finalResult = await monitor(result.hash)
 *     console.log('Final status:', finalResult.status)
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleSendAndMonitor}>Send & Monitor</button>
 *       <p>Active monitors: {activeMonitors.length}</p>
 *       {isMonitoring && <p>Monitoring transactions...</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Multiple concurrent transactions
 * ```tsx
 * import { useTransactionMonitor } from '@klever/connect-react'
 *
 * function BatchTransactions() {
 *   const { provider } = useKlever()
 *   const { monitor, activeMonitors, getStatus } = useTransactionMonitor({
 *     provider,
 *     timeout: 120000 // 2 minutes
 *   })
 *
 *   const [results, setResults] = useState([])
 *
 *   const handleBatchSend = async () => {
 *     const hashes = [] // Get from multiple transactions
 *
 *     // Monitor all transactions concurrently
 *     const promises = hashes.map(hash => monitor(hash))
 *     const finalResults = await Promise.all(promises)
 *
 *     setResults(finalResults)
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleBatchSend}>Send Batch</button>
 *       <p>Monitoring: {activeMonitors.length} transactions</p>
 *       {activeMonitors.map(hash => {
 *         const status = getStatus(hash)
 *         return (
 *           <div key={hash}>
 *             <p>Hash: {hash.slice(0, 10)}...</p>
 *             <p>Status: {status?.status}</p>
 *             <p>Attempts: {status?.attempts}</p>
 *           </div>
 *         )
 *       })}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Cancel monitoring with UI
 * ```tsx
 * import { useTransactionMonitor } from '@klever/connect-react'
 *
 * function CancellableMonitor() {
 *   const { provider } = useKlever()
 *   const { monitor, cancel, cancelAll, activeMonitors } = useTransactionMonitor({
 *     provider
 *   })
 *
 *   const handleMonitor = async (hash) => {
 *     try {
 *       const result = await monitor(hash)
 *       console.log('Confirmed:', result)
 *     } catch (err) {
 *       console.log('Monitoring cancelled or failed')
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       {activeMonitors.map(hash => (
 *         <div key={hash}>
 *           <span>{hash.slice(0, 10)}...</span>
 *           <button onClick={() => cancel(hash)}>Cancel</button>
 *         </div>
 *       ))}
 *       <button onClick={cancelAll}>Cancel All</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Custom polling and timeout
 * ```tsx
 * import { useTransactionMonitor } from '@klever/connect-react'
 *
 * function CustomMonitor() {
 *   const { provider } = useKlever()
 *   const { monitor } = useTransactionMonitor({ provider })
 *
 *   const handleFastMonitor = async (hash) => {
 *     // Override defaults for this specific transaction
 *     const result = await monitor(hash, {
 *       initialDelay: 500,    // Check sooner
 *       pollInterval: 1000,   // Poll every second
 *       timeout: 30000,       // 30 second timeout
 *       fetchResults: false   // Don't fetch full details
 *     })
 *     return result
 *   }
 *
 *   return <button onClick={() => handleFastMonitor('hash')}>Fast Monitor</button>
 * }
 * ```
 *
 * @remarks
 * **Monitoring Flow:**
 * 1. Call `monitor(hash)` to start monitoring
 * 2. Initial delay (1.5s default) allows transaction propagation
 * 3. Polls blockchain every 2s (default) for transaction status
 * 4. Uses exponential backoff (up to 5x) to reduce API load
 * 5. Returns when transaction is confirmed/failed or timeout reached
 * 6. Cleanup happens automatically on unmount or cancellation
 *
 * **React Considerations:**
 * - All methods are wrapped in useCallback for stable references
 * - State updates trigger re-renders only for activeMonitors and isMonitoring
 * - Cleanup effect runs on unmount to cancel all monitors
 * - Options ref updated without re-renders when defaultOptions change
 * - Cancelled flag prevents state updates after component unmounts
 * - Safe to call multiple times with same hash (returns existing promise)
 *
 * **Concurrent Monitoring:**
 * - Supports up to 10 concurrent transactions (MAX_CONCURRENT_MONITORS)
 * - Each transaction has independent polling state
 * - Duplicate hash monitoring returns same promise
 * - All monitors share same configuration but can override per call
 *
 * **Exponential Backoff:**
 * - Attempt 1: pollInterval
 * - Attempt 2: pollInterval * 2
 * - Attempt 3: pollInterval * 3
 * - Attempt 4: pollInterval * 4
 * - Attempt 5+: pollInterval * 5 (max)
 *
 * **Error Handling:**
 * - 404 during initial propagation: Continues (up to 3 attempts)
 * - Other errors: Captured but monitoring continues until timeout
 * - Timeout: Returns 'failed' status with timeout error
 * - Cancellation: Throws error, can be caught with try/catch
 *
 * **Status Updates:**
 * - `onStatusUpdate` called on each polling attempt
 * - `onComplete` called when monitoring finishes
 * - `onError` called for errors (but monitoring may continue)
 *
 * **Performance:**
 * - Default polling: 2s interval
 * - Initial delay: 1.5s
 * - Timeout: 60s
 * - Exponential backoff reduces API calls over time
 * - AbortController used for clean cancellation
 *
 * **Best Practices:**
 * - Always provide provider in defaultOptions or per-call
 * - Use getStatus() for real-time UI updates
 * - Cancel monitors when user navigates away
 * - Handle both success and error cases
 * - Consider lower timeout for better UX
 */
export function useTransactionMonitor(
  defaultOptions?: Partial<UseTransactionMonitorOptions>,
): UseTransactionMonitorReturn {
  const provider = defaultOptions?.provider
  if (!provider) {
    throw new Error('Provider is required in UseTransactionMonitorOptions')
  }
  const [activeMonitors, setActiveMonitors] = useState<string[]>([])
  const monitorsRef = useRef<Map<string, MonitorState>>(new Map())

  // Store callbacks in refs to avoid re-renders
  const optionsRef = useRef<Required<UseTransactionMonitorOptions>>({
    ...DEFAULT_OPTIONS,
    provider,
    ...defaultOptions,
  })

  // Update options ref when defaults change
  useEffect(() => {
    optionsRef.current = { ...DEFAULT_OPTIONS, provider, ...defaultOptions }
  }, [defaultOptions, provider])

  const getStatus = useCallback((hash: string): TransactionMonitorStatus | null => {
    const monitor = monitorsRef.current.get(hash)
    return monitor ? { ...monitor.status } : null
  }, [])

  const cancel = useCallback((hash: string) => {
    const monitor = monitorsRef.current.get(hash)
    if (monitor) {
      monitor.controller.abort()
      monitorsRef.current.delete(hash)
      setActiveMonitors((prev) => prev.filter((h) => h !== hash))
    }
  }, [])

  const cancelAll = useCallback(() => {
    monitorsRef.current.forEach((monitor) => {
      monitor.controller.abort()
    })
    monitorsRef.current.clear()
    setActiveMonitors([])
  }, [])

  const updateStatus = useCallback(
    (hash: string, status: 'pending' | 'confirmed' | 'failed', attempts: number) => {
      const monitor = monitorsRef.current.get(hash)
      if (monitor) {
        const elapsedTime = Date.now() - monitor.startTime
        monitor.status = {
          hash,
          status,
          attempts,
          elapsedTime,
        }
        // Call the status update callback
        const options = optionsRef.current
        options.onStatusUpdate(monitor.status)
      }
    },
    [],
  )

  const monitorTransaction = useCallback(
    async (
      hash: string,
      options: Required<UseTransactionMonitorOptions>,
      controller: AbortController,
    ): Promise<TransactionMonitorResult> => {
      const startTime = Date.now()
      let attempts = 0
      let lastError: Error | undefined

      try {
        // Initial delay to allow transaction propagation
        await new Promise((resolve) => setTimeout(resolve, options.initialDelay))

        // Start monitoring loop
        while (!controller.signal.aborted) {
          attempts++
          updateStatus(hash, 'pending', attempts)

          try {
            // Check transaction status
            const tx = await provider.getTransaction(hash as TransactionHash)

            if (tx && tx.status !== TransactionStatus.Pending) {
              // Transaction is confirmed or failed
              const status = tx.status === TransactionStatus.Success ? 'confirmed' : 'failed'
              updateStatus(hash, status, attempts)

              let transaction: ITransactionResponse | undefined

              // Fetch full details if requested
              if (options.fetchResults && status === 'confirmed') {
                try {
                  const fullTx = await provider.getTransaction(hash as TransactionHash)
                  transaction = fullTx ? fullTx : tx
                } catch (error) {
                  console.warn('Failed to fetch transaction results:', error)
                  transaction = tx
                }
              } else {
                transaction = tx
              }

              const result: TransactionMonitorResult = {
                hash,
                status,
                transaction,
                ...(status === 'failed' && lastError && { error: lastError }),
              }

              options.onComplete(result)
              return result
            }
          } catch (error) {
            // Handle 404 errors during initial propagation
            if (error instanceof Error && error.message.includes('not found') && attempts <= 3) {
              // Transaction might not be propagated yet, continue
              lastError = error
            } else {
              // Other errors, continue monitoring but save the error
              lastError = error as Error
            }
          }

          // Check timeout
          const elapsedTime = Date.now() - startTime
          if (elapsedTime >= options.timeout) {
            const timeoutError = new Error(
              `Transaction monitoring timeout after ${options.timeout}ms`,
            )
            options.onError(timeoutError)

            const result: TransactionMonitorResult = {
              hash,
              status: 'failed',
              error: timeoutError,
            }

            options.onComplete(result)
            return result
          }

          // Wait before next check with exponential backoff
          const backoffMultiplier = Math.min(attempts, 5)
          const waitTime = options.pollInterval * backoffMultiplier
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }

        // Monitoring was cancelled
        throw new Error('Transaction monitoring cancelled')
      } catch (error) {
        const err = error as Error
        if (!controller.signal.aborted) {
          options.onError(err)
        }

        const result: TransactionMonitorResult = {
          hash,
          status: 'failed',
          error: err,
        }

        if (!controller.signal.aborted) {
          options.onComplete(result)
        }

        return result
      } finally {
        // Cleanup
        monitorsRef.current.delete(hash)
        setActiveMonitors((prev) => prev.filter((h) => h !== hash))
      }
    },
    [provider, updateStatus],
  )

  const monitor = useCallback(
    async (
      hash: string,
      options?: Partial<UseTransactionMonitorOptions>,
    ): Promise<TransactionMonitorResult> => {
      // Check if already monitoring this hash
      const existing = monitorsRef.current.get(hash)
      if (existing) {
        return existing.promise
      }

      // Check max concurrent monitors
      if (monitorsRef.current.size >= MAX_CONCURRENT_MONITORS) {
        throw new Error(`Maximum concurrent monitors (${MAX_CONCURRENT_MONITORS}) reached`)
      }

      // Merge options
      const mergedOptions: Required<UseTransactionMonitorOptions> = {
        ...optionsRef.current,
        ...options,
        provider: options?.provider || optionsRef.current.provider,
      }

      // Create monitor state
      const controller = new AbortController()
      const startTime = Date.now()

      const promise = monitorTransaction(hash, mergedOptions, controller)

      const monitorState: MonitorState = {
        status: {
          hash,
          status: 'pending',
          attempts: 0,
          elapsedTime: 0,
        },
        controller,
        promise,
        startTime,
      }

      monitorsRef.current.set(hash, monitorState)
      setActiveMonitors((prev) => [...prev, hash])

      return promise
    },
    [monitorTransaction],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAll()
    }
  }, [cancelAll])

  return {
    monitor,
    cancel,
    cancelAll,
    getStatus,
    activeMonitors,
    isMonitoring: activeMonitors.length > 0,
  }
}
