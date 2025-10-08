import * as React from 'react'
import { useState, useEffect } from 'react'
import type { KleverAddress } from '@klever/connect-core'
import { formatUnits } from '@klever/connect-core'

import { useKlever } from '../context'

/**
 * Balance information for a token
 */
export interface Balance {
  /** Token/asset ID (e.g., 'KLV', 'KDA-TOKEN-ID') */
  token: string
  /** Balance amount in smallest units (bigint) */
  amount: bigint
  /** Number of decimal places for the token */
  precision: number
  /** Human-readable formatted balance string */
  formatted: string
}

/**
 * useBalance - Hook for fetching and monitoring token balances
 *
 * Automatically fetches and polls for balance updates of a specific token.
 * Handles both connected wallet balance and any arbitrary address.
 *
 * @param token - Token/asset ID to fetch balance for (default: 'KLV')
 * @param address - Optional address to fetch balance for (default: connected wallet)
 * @returns Balance data, loading state, error state, and refetch function
 *
 * @example Basic KLV balance display
 * ```tsx
 * import { useBalance } from '@klever/connect-react'
 *
 * function BalanceDisplay() {
 *   const { balance, isLoading, error } = useBalance('KLV')
 *
 *   if (isLoading) return <p>Loading balance...</p>
 *   if (error) return <p>Error: {error.message}</p>
 *   if (!balance) return <p>No balance data</p>
 *
 *   return (
 *     <div>
 *       <p>Token: {balance.token}</p>
 *       <p>Balance: {balance.formatted} KLV</p>
 *       <p>Raw amount: {balance.amount.toString()}</p>
 *       <p>Precision: {balance.precision}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example KDA token balance with manual refetch
 * ```tsx
 * import { useBalance } from '@klever/connect-react'
 *
 * function KDABalance() {
 *   const { balance, isLoading, refetch } = useBalance('MY-KDA-TOKEN')
 *
 *   return (
 *     <div>
 *       {isLoading ? (
 *         <p>Loading...</p>
 *       ) : (
 *         <div>
 *           <p>Balance: {balance?.formatted || '0'}</p>
 *           <button onClick={refetch}>Refresh</button>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Check balance of any address
 * ```tsx
 * import { useBalance } from '@klever/connect-react'
 * import { useState } from 'react'
 *
 * function AddressBalanceChecker() {
 *   const [address, setAddress] = useState('')
 *   const { balance, isLoading } = useBalance('KLV', address)
 *
 *   return (
 *     <div>
 *       <input
 *         value={address}
 *         onChange={(e) => setAddress(e.target.value)}
 *         placeholder="Enter address..."
 *       />
 *       {isLoading && <p>Loading...</p>}
 *       {balance && <p>Balance: {balance.formatted} KLV</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Multiple token balances
 * ```tsx
 * import { useBalance } from '@klever/connect-react'
 *
 * function MultiTokenBalance() {
 *   const klv = useBalance('KLV')
 *   const kda1 = useBalance('KDA-TOKEN-1')
 *   const kda2 = useBalance('KDA-TOKEN-2')
 *
 *   return (
 *     <div>
 *       <p>KLV: {klv.balance?.formatted || '0'}</p>
 *       <p>Token 1: {kda1.balance?.formatted || '0'}</p>
 *       <p>Token 2: {kda2.balance?.formatted || '0'}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * **Polling Behavior:**
 * - Automatically polls for updates every 10 seconds
 * - Polling starts when component mounts
 * - Polling stops when component unmounts
 * - Can manually trigger refetch using `refetch()` function
 *
 * **React Considerations:**
 * - Effect depends on: provider, address, token, network, refreshKey
 * - Component re-renders on balance updates (every 10s or on network change)
 * - Cleanup function cancels pending requests and stops polling
 * - State updates are cancelled if component unmounts during fetch
 * - Refetch function is stable (wrapped in useCallback)
 *
 * **State Management:**
 * - `balance`: Null initially, Balance object after successful fetch
 * - `isLoading`: True during fetch, false after completion
 * - `error`: Null on success, Error object on failure
 * - Network change triggers automatic refetch
 *
 * **Error Handling:**
 * - Account not found: Returns zero balance (not an error)
 * - Invalid address: Error captured in error state
 * - Network error: Error captured, polling continues
 * - Balance is set to 0 with default precision if account doesn't exist
 *
 * **Balance Object:**
 * - `token`: Asset ID string
 * - `amount`: Raw amount in smallest units (bigint for large numbers)
 * - `precision`: Decimal places for the token
 * - `formatted`: Human-readable string (e.g., "100.123456")
 *
 * **Performance:**
 * - Polling interval: 10 seconds (hardcoded)
 * - Cancelled flag prevents state updates after unmount
 * - Multiple useBalance hooks can run independently
 */
export function useBalance(
  token: string = 'KLV',
  address?: string,
): { balance: Balance | null; isLoading: boolean; error: Error | null; refetch: () => void } {
  const { provider, address: walletAddress, currentNetwork } = useKlever()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const targetAddress = address || walletAddress

  const refetch = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!targetAddress) {
      setBalance(null)
      return
    }

    setError(null)

    let cancelled = false

    async function fetchBalance(): Promise<void> {
      if (!targetAddress) return

      setIsLoading(true)
      setError(null)

      try {
        const account = await provider.getAccount(targetAddress as KleverAddress)
        const assetBalance = account.assets?.find((a) => a.assetId === token)

        if (!cancelled) {
          if (assetBalance) {
            // Get precision from asset metadata, default to 0 if not available
            const precision = assetBalance.precision ?? 0
            const amount = BigInt(assetBalance.balance)
            const formatted = formatUnits(amount, precision)

            setBalance({
              token,
              amount,
              precision,
              formatted,
            })
          } else {
            // For zero balance, use default precision of 0
            setBalance({
              token,
              amount: 0n,
              precision: 0,
              formatted: '0',
            })
          }
        }
      } catch (err) {
        // If account doesn't exist on blockchain yet, return zero balance
        if (
          err instanceof Error &&
          (err.message.includes('does not exist') ||
            err.message.includes('Account not found') ||
            err.message.includes('cannot find account') ||
            err.message.includes('not_found'))
        ) {
          if (!cancelled) {
            setBalance({
              token,
              amount: 0n,
              precision: 6,
              formatted: '0',
            })
            // Clear the error since this is expected
            setError(null)
          }
        } else {
          if (!cancelled) {
            setError(err as Error)
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchBalance()

    // Poll for balance updates every 10 seconds
    const interval = setInterval(() => void fetchBalance(), 10000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [provider, targetAddress, token, currentNetwork, refreshKey])

  return { balance, isLoading, error, refetch }
}
