import type { TransactionReceipt } from '@klever/connect-provider'
import type { TXTypeValue } from '@klever/connect-core'
import { TXType } from '@klever/connect-core'

import type { TransferRequest } from '@klever/connect-transactions'
import { TransactionBuilder } from '@klever/connect-transactions'
import { useState, useCallback } from 'react'

import { useKlever } from '../context'

// Helper function to build payload for different transaction types
function buildPayloadForType(
  type: TXTypeValue,
  params: Record<string, unknown>,
): Record<string, unknown> {
  switch (type) {
    case TXType.Transfer: {
      const payload: Record<string, unknown> = {
        toAddress: params['to'] as string,
        receiver: params['to'] as string, // Include both for compatibility
        amount: params['amount'] as string | number,
      }
      if (params['token'] && params['token'] !== 'KLV') {
        payload['kda'] = params['token'] as string
        payload['assetId'] = params['token'] as string // Include both for compatibility
      }
      return payload
    }
    case TXType.Freeze: {
      const payload: Record<string, unknown> = {
        amount: params['amount'] as string | number,
      }
      if (params['token'] && params['token'] !== 'KLV') {
        payload['kda'] = params['token'] as string
        payload['assetId'] = params['token'] as string // Include both for compatibility
      }
      return payload
    }
    case TXType.Unfreeze: {
      const payload: Record<string, unknown> = {
        bucketId: params['bucket'] as string,
      }
      if (params['token'] && params['token'] !== 'KLV') {
        payload['kda'] = params['token'] as string
        payload['assetId'] = params['token'] as string // Include both for compatibility
      }
      return payload
    }
    case TXType.Claim: {
      const payload: Record<string, unknown> = {
        claimType: params['claimType'] as number,
      }
      if (params['token'] && params['token'] !== 'KLV') {
        payload['kda'] = params['token'] as string
        payload['assetId'] = params['token'] as string // Include both for compatibility
      }
      return payload
    }
    default:
      return params
  }
}

export interface TransactionCallbacks {
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: Error) => void
}

export function useTransaction(options?: TransactionCallbacks): {
  sendTransaction: (type: TXTypeValue, params: Record<string, unknown>) => Promise<void>
  sendKLV: (to: string, amount: number | string) => Promise<void>
  sendKDA: (to: string, amount: number | string, kdaId: string, precision?: number) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt
  reset: () => void
} {
  const { wallet, provider } = useKlever()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TransactionReceipt | null>(null)

  const sendTransaction = useCallback(
    async (type: TXTypeValue, params: Record<string, unknown>): Promise<void> => {
      if (!wallet) {
        const err = new Error('Wallet not connected')
        setError(err)
        options?.onError?.(err)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let result: { hash: string; status?: string; blockNumber?: number; timestamp?: number }

        // Check if wallet supports sendTransaction (BrowserWallet with extension)
        if (wallet.sendTransaction) {
          // Use extension to build and send transaction
          const payload = buildPayloadForType(type, params)
          result = await wallet.sendTransaction(type, payload)
        } else {
          // Fallback to local transaction building
          const builder = new TransactionBuilder(provider)

          // Build transaction based on type
          if (type === TXType.Transfer && params['to'] && params['amount']) {
            const transferParams: TransferRequest = {
              receiver: params['to'] as string,
              amount: params['amount'] as bigint | number | string,
            }
            if (params['token']) {
              transferParams.kda = params['token'] as string
            }
            builder.transfer(transferParams)
          }

          // Set the sender address
          builder.sender(wallet.address)

          const tx = await builder.build()
          const signedTx = await wallet.signTransaction(tx)
          if (!wallet.broadcastTransaction) {
            throw new Error('Wallet does not support broadcastTransaction')
          }
          const broadcastResult = await wallet.broadcastTransaction(signedTx)
          const hash = typeof broadcastResult === 'string' ? broadcastResult : broadcastResult.hash

          result = {
            hash,
            status: 'success' as const,
            blockNumber: 0,
            timestamp: Date.now(),
          }
        }

        const receipt: TransactionReceipt = {
          hash: result.hash,
          status: (result.status || 'success') as 'pending' | 'success' | 'failed',
          blockNumber: result.blockNumber || 0,
          timestamp: result.timestamp || Date.now(),
        }
        setData(receipt)
        options?.onSuccess?.(receipt)

        // Don't return anything, just update state
      } catch (err) {
        const error = err as Error
        setError(error)
        options?.onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [wallet, provider, options],
  )

  const sendKLV = useCallback(
    async (to: string, amount: number | string) => {
      const amountInPrecision = typeof amount === 'number' ? amount * 1e6 : amount
      return sendTransaction(TXType.Transfer, {
        to,
        amount: amountInPrecision,
        token: 'KLV',
      })
    },
    [sendTransaction],
  )

  const sendKDA = useCallback(
    async (to: string, amount: number | string, kdaId: string, precision?: number) => {
      let amountInPrecision: number | string

      if (typeof amount === 'number') {
        // If precision is not provided, default to 6
        const tokenPrecision = precision ?? 6
        amountInPrecision = amount * Math.pow(10, tokenPrecision)
      } else {
        // If amount is string, assume it's already in the correct precision
        amountInPrecision = amount
      }

      return sendTransaction(TXType.Transfer, {
        to,
        amount: amountInPrecision,
        token: kdaId,
      })
    },
    [sendTransaction],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    sendTransaction,
    sendKLV,
    sendKDA,
    isLoading,
    error,
    data: data as TransactionReceipt,
    reset,
  }
}

// Convenience hooks for specific transaction types
export function useTransfer(options?: TransactionCallbacks): {
  transfer: (params: {
    to: string
    amount: bigint | number | string
    token?: string
  }) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt
  reset: () => void
} {
  const { sendTransaction, ...rest } = useTransaction(options)

  const transfer = useCallback(
    async (params: { to: string; amount: bigint | number | string; token?: string }) => {
      return sendTransaction(TXType.Transfer, params)
    },
    [sendTransaction],
  )

  return { transfer, ...rest }
}

export function useFreeze(options?: TransactionCallbacks): {
  freeze: (params: { amount: bigint | number | string; token?: string }) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt
  reset: () => void
} {
  const { sendTransaction, ...rest } = useTransaction(options)

  const freeze = useCallback(
    async (params: { amount: bigint | number | string; token?: string }) => {
      return sendTransaction(TXType.Freeze, params)
    },
    [sendTransaction],
  )

  return { freeze, ...rest }
}

export function useUnfreeze(options?: TransactionCallbacks): {
  unfreeze: (params: { bucket: string; token?: string }) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt
  reset: () => void
} {
  const { sendTransaction, ...rest } = useTransaction(options)

  const unfreeze = useCallback(
    async (params: { bucket: string; token?: string }) => {
      return sendTransaction(TXType.Unfreeze, params)
    },
    [sendTransaction],
  )

  return { unfreeze, ...rest }
}

export function useClaim(options?: TransactionCallbacks): {
  claim: (params: { claimType: number; token?: string }) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt
  reset: () => void
} {
  const { sendTransaction, ...rest } = useTransaction(options)

  const claim = useCallback(
    async (params: { claimType: number; token?: string }) => {
      return sendTransaction(TXType.Claim, params)
    },
    [sendTransaction],
  )

  return { claim, ...rest }
}

// Export TransactionOptions as alias for backward compatibility
export type TransactionOptions = TransactionCallbacks
