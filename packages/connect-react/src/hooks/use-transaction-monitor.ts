import type { TransactionHash } from '@klever/connect-core'
import type { IProvider, ITransactionResponse } from '@klever/connect-provider'
import { TransactionStatus } from '@klever/connect-provider'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseTransactionMonitorOptions {
  // Delay before first check (ms) - allows tx propagation
  initialDelay?: number // default: 1500

  // Polling interval (ms)
  pollInterval?: number // default: 2000

  // Maximum time to wait (ms)
  timeout?: number // default: 60000

  // Whether to fetch full transaction details with results
  fetchResults?: boolean // default: true

  provider: IProvider // Custom provider instance

  // Callback for status updates
  onStatusUpdate?: (status: TransactionMonitorStatus) => void

  // Callback when monitoring completes
  onComplete?: (result: TransactionMonitorResult) => void

  // Callback for errors
  onError?: (error: Error) => void
}

export interface TransactionMonitorStatus {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  attempts: number
  elapsedTime: number
}

export interface TransactionMonitorResult {
  hash: string
  status: 'confirmed' | 'failed'
  transaction?: ITransactionResponse
  error?: Error
}

export interface UseTransactionMonitorReturn {
  // Start monitoring a transaction
  monitor: (
    hash: string,
    options?: Partial<UseTransactionMonitorOptions>,
  ) => Promise<TransactionMonitorResult>

  // Cancel monitoring a specific transaction
  cancel: (hash: string) => void

  // Cancel all active monitors
  cancelAll: () => void

  // Get current monitoring status for a hash
  getStatus: (hash: string) => TransactionMonitorStatus | null

  // Get all active monitors
  activeMonitors: string[]

  // Overall loading state
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
