import type { TransactionReceipt, ContractRequestData } from '@klever/connect-provider'
import { TXType } from '@klever/connect-core'

import type {
  TransferRequest,
  FreezeRequest,
  UnfreezeRequest,
  ClaimRequest,
} from '@klever/connect-provider'
import { TransactionBuilder } from '@klever/connect-transactions'
import { useState, useCallback } from 'react'

import { useKlever } from '../context'

export interface TransactionCallbacks {
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: Error) => void
}

export interface UseTransactionReturn {
  sendTransaction: (contract: ContractRequestData) => Promise<void>
  sendKLV: (to: string, amount: number | string) => Promise<void>
  sendKDA: (to: string, amount: number | string, kdaId: string, precision?: number) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt | null
  reset: () => void
}

export function useTransaction(options?: TransactionCallbacks): UseTransactionReturn {
  const { wallet, provider } = useKlever()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TransactionReceipt | null>(null)

  const sendTransaction = useCallback(
    async (contract: ContractRequestData): Promise<void> => {
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
          // Use extension to build and send transaction - it handles field mapping internally
          result = await wallet.sendTransaction(contract)
        } else {
          // Fallback to local transaction building using TransactionBuilder
          const builder = new TransactionBuilder(provider)

          // Use addContract method to handle any transaction type
          builder.addContract(contract).sender(wallet.address)

          const tx = await builder.build()
          const signedTx = await wallet.signTransaction(tx)
          if (!wallet.broadcastTransaction) {
            throw new Error('Wallet does not support broadcastTransaction')
          }
          const hash = await wallet.broadcastTransaction(signedTx)

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
      return sendTransaction({
        contractType: TXType.Transfer,
        receiver: to,
        amount: amountInPrecision,
      } as ContractRequestData)
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

      return sendTransaction({
        contractType: TXType.Transfer,
        receiver: to,
        amount: amountInPrecision,
        kda: kdaId,
      } as ContractRequestData)
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
    data,
    reset,
  }
}

// Convenience hooks for specific transaction types
export interface UseTransferReturn {
  transfer: (params: TransferRequest) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt | null
  reset: () => void
}

export function useTransfer(options?: TransactionCallbacks): UseTransferReturn {
  const { sendTransaction, ...rest } = useTransaction(options)

  const transfer = useCallback(
    async (params: TransferRequest) => {
      return sendTransaction({
        contractType: TXType.Transfer,
        ...params,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  return { transfer, ...rest }
}

export interface UseFreezeReturn {
  freeze: (params: FreezeRequest) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt | null
  reset: () => void
}

export function useFreeze(options?: TransactionCallbacks): UseFreezeReturn {
  const { sendTransaction, ...rest } = useTransaction(options)

  const freeze = useCallback(
    async (params: FreezeRequest) => {
      return sendTransaction({
        contractType: TXType.Freeze,
        ...params,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  return { freeze, ...rest }
}

export interface UseUnfreezeReturn {
  unfreeze: (params: UnfreezeRequest) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt | null
  reset: () => void
}

export function useUnfreeze(options?: TransactionCallbacks): UseUnfreezeReturn {
  const { sendTransaction, ...rest } = useTransaction(options)

  const unfreeze = useCallback(
    async (params: UnfreezeRequest) => {
      return sendTransaction({
        contractType: TXType.Unfreeze,
        ...params,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  return { unfreeze, ...rest }
}

export interface UseClaimReturn {
  claim: (params: ClaimRequest) => Promise<void>
  isLoading: boolean
  error: Error | null
  data: TransactionReceipt | null
  reset: () => void
}

export function useClaim(options?: TransactionCallbacks): UseClaimReturn {
  const { sendTransaction, ...rest } = useTransaction(options)

  const claim = useCallback(
    async (params: ClaimRequest) => {
      return sendTransaction({
        contractType: TXType.Claim,
        ...params,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  return { claim, ...rest }
}

// Export TransactionOptions as alias for backward compatibility
export type TransactionOptions = TransactionCallbacks
