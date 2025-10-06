import type {
  TransactionReceipt,
  ContractRequestData,
  TransactionSubmitResult,
  AmountLike,
} from '@klever/connect-provider'
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
  sendTransaction: (contract: ContractRequestData) => Promise<TransactionSubmitResult>
  sendKLV: (to: string, amount: AmountLike) => Promise<TransactionSubmitResult>
  sendKDA: (to: string, amount: AmountLike, kdaId: string) => Promise<TransactionSubmitResult>
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
    async (contract: ContractRequestData): Promise<TransactionSubmitResult> => {
      if (!wallet) {
        const err = new Error('Wallet not connected')
        setError(err)
        options?.onError?.(err)
        throw err
      }

      setIsLoading(true)
      setError(null)

      try {
        let result: TransactionSubmitResult

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
            transaction: signedTx,
            wait: async () => {
              const tx = await provider.waitForTransaction(hash)
              if (!tx) {
                throw new Error(`Transaction ${String(hash)} not found or timed out`)
              }
              return tx
            },
          }
        }

        const receipt: TransactionReceipt = {
          hash: result.hash,
          status: result.status,
          blockNumber: 0,
          timestamp: Date.now(),
        }
        setData(receipt)
        options?.onSuccess?.(receipt)

        return result
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
    async (to: string, amount: AmountLike) => {
      // No auto-conversion - amount must be in smallest units
      // Use parseKLV() from @klever/connect-core for human-readable amounts
      return sendTransaction({
        contractType: TXType.Transfer,
        receiver: to,
        amount: amount,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  const sendKDA = useCallback(
    async (to: string, amount: AmountLike, kdaId: string) => {
      // No auto-conversion - amount must be in smallest units
      // Use parseUnits() from @klever/connect-core for human-readable amounts
      return sendTransaction({
        contractType: TXType.Transfer,
        receiver: to,
        amount: amount,
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
  transfer: (params: TransferRequest) => Promise<TransactionSubmitResult>
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
  freeze: (params: FreezeRequest) => Promise<TransactionSubmitResult>
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
  unfreeze: (params: UnfreezeRequest) => Promise<TransactionSubmitResult>
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
  claim: (params: ClaimRequest) => Promise<TransactionSubmitResult>
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
