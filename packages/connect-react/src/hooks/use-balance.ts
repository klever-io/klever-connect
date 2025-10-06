import * as React from 'react'
import { useState, useEffect } from 'react'
import type { KleverAddress } from '@klever/connect-core'
import { formatUnits } from '@klever/connect-core'

import { useKlever } from '../context'

export interface Balance {
  token: string
  amount: bigint
  precision: number
  formatted: string
}

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

    // Clear balance immediately when network changes to show loading state
    setBalance(null)
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
