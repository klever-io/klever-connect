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

/**
 * Callback functions for transaction lifecycle events
 */
export interface TransactionCallbacks {
  /** Called when transaction is successfully submitted and confirmed */
  onSuccess?: (receipt: TransactionReceipt) => void
  /** Called when transaction fails or encounters an error */
  onError?: (error: Error) => void
}

/**
 * Return type for useTransaction hook
 */
export interface UseTransactionReturn {
  /** Send any transaction type using ContractRequestData */
  sendTransaction: (contract: ContractRequestData) => Promise<TransactionSubmitResult>
  /** Convenience method to send KLV tokens */
  sendKLV: (to: string, amount: AmountLike) => Promise<TransactionSubmitResult>
  /** Convenience method to send KDA tokens */
  sendKDA: (to: string, amount: AmountLike, kdaId: string) => Promise<TransactionSubmitResult>
  /** Boolean indicating if transaction is in progress */
  isLoading: boolean
  /** Error object if transaction failed */
  error: Error | null
  /** Transaction receipt after successful submission */
  data: TransactionReceipt | null
  /** Reset transaction state (clears data, error, and loading) */
  reset: () => void
}

/**
 * useTransaction - Core hook for sending any type of transaction
 *
 * Provides a flexible interface for building and sending transactions to the Klever blockchain.
 * Handles both extension-based signing (BrowserWallet) and local transaction building.
 *
 * @param options - Optional callbacks for transaction lifecycle events
 * @returns Transaction methods and state
 *
 * @example Basic KLV transfer
 * ```tsx
 * import { useTransaction } from '@klever/connect-react'
 * import { parseKLV } from '@klever/connect-core'
 *
 * function TransferButton() {
 *   const { sendKLV, isLoading, error, data } = useTransaction({
 *     onSuccess: (receipt) => console.log('Success!', receipt.hash),
 *     onError: (err) => console.error('Failed:', err.message)
 *   })
 *
 *   const handleTransfer = async () => {
 *     await sendKLV('klv1receiver...', parseKLV('10'))
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleTransfer} disabled={isLoading}>
 *         {isLoading ? 'Sending...' : 'Send 10 KLV'}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *       {data && <p>Success! Hash: {data.hash}</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Custom transaction with contract data
 * ```tsx
 * import { useTransaction } from '@klever/connect-react'
 * import { TXType } from '@klever/connect-core'
 *
 * function CustomTransaction() {
 *   const { sendTransaction, isLoading } = useTransaction()
 *
 *   const handleCustomTx = async () => {
 *     const result = await sendTransaction({
 *       contractType: TXType.Transfer,
 *       receiver: 'klv1receiver...',
 *       amount: 1000000,
 *       kda: 'KDA-TOKEN-ID'
 *     })
 *
 *     // Wait for confirmation
 *     const receipt = await result.wait()
 *     console.log('Confirmed in block:', receipt.blockNumber)
 *   }
 *
 *   return (
 *     <button onClick={handleCustomTx} disabled={isLoading}>
 *       Send Custom Transaction
 *     </button>
 *   )
 * }
 * ```
 *
 * @example Error handling and state management
 * ```tsx
 * import { useTransaction } from '@klever/connect-react'
 *
 * function TransactionWithStates() {
 *   const { sendKLV, isLoading, error, data, reset } = useTransaction()
 *
 *   const handleSend = async () => {
 *     try {
 *       await sendKLV('klv1receiver...', 1000000)
 *     } catch (err) {
 *       // Error already captured in `error` state
 *       console.error('Transaction failed:', err)
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleSend} disabled={isLoading}>
 *         Send Transaction
 *       </button>
 *       {isLoading && <p>Transaction in progress...</p>}
 *       {error && (
 *         <div>
 *           <p>Error: {error.message}</p>
 *           <button onClick={reset}>Try Again</button>
 *         </div>
 *       )}
 *       {data && <p>Transaction Hash: {data.hash}</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * **Transaction Flow:**
 * 1. User calls `sendTransaction`, `sendKLV`, or `sendKDA`
 * 2. Hook checks for connected wallet
 * 3. If BrowserWallet: Extension handles transaction building and signing
 * 4. If local wallet: Uses TransactionBuilder to build and sign locally
 * 5. Transaction is broadcast to the network
 * 6. Receipt is returned with hash and wait() method
 *
 * **State Management:**
 * - `isLoading`: Set to true during transaction, false after completion/error
 * - `error`: Null on success, Error object on failure
 * - `data`: Null until success, TransactionReceipt after submission
 * - State updates trigger component re-renders
 *
 * **React Considerations:**
 * - All methods are wrapped in useCallback for stable references
 * - State updates are batched for optimal performance
 * - Component re-renders occur on isLoading, error, or data changes
 * - No cleanup needed - hook manages its own state
 *
 * **Amount Format:**
 * - Amounts must be in smallest units (e.g., 1 KLV = 1000000 units)
 * - Use `parseKLV()` from @klever/connect-core for human-readable amounts
 * - Use `parseUnits()` for KDA tokens with custom precision
 *
 * **Error Cases:**
 * - Wallet not connected: Throws immediately
 * - Transaction rejected: Error captured in error state
 * - Network error: Error captured with retry possible
 * - Invalid parameters: Error thrown and captured
 */
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

/**
 * Return type for useTransfer hook
 */
export interface UseTransferReturn {
  /** Transfer tokens to another address */
  transfer: (params: TransferRequest) => Promise<TransactionSubmitResult>
  /** Boolean indicating if transaction is in progress */
  isLoading: boolean
  /** Error object if transaction failed */
  error: Error | null
  /** Transaction receipt after successful submission */
  data: TransactionReceipt | null
  /** Reset transaction state */
  reset: () => void
}

/**
 * useTransfer - Convenience hook for transfer transactions
 *
 * Simplified hook specifically for sending KLV or KDA tokens to another address.
 * Wraps useTransaction with Transfer-specific parameters.
 *
 * @param options - Optional callbacks for transaction lifecycle events
 * @returns Transfer method and transaction state
 *
 * @example Transfer KLV tokens
 * ```tsx
 * import { useTransfer } from '@klever/connect-react'
 * import { parseKLV } from '@klever/connect-core'
 *
 * function TransferForm() {
 *   const { transfer, isLoading, error } = useTransfer({
 *     onSuccess: () => alert('Transfer successful!'),
 *     onError: (err) => alert('Transfer failed: ' + err.message)
 *   })
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault()
 *     await transfer({
 *       receiver: 'klv1receiver...',
 *       amount: parseKLV('10')
 *     })
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Sending...' : 'Send 10 KLV'}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *     </form>
 *   )
 * }
 * ```
 *
 * @example Transfer KDA tokens
 * ```tsx
 * import { useTransfer } from '@klever/connect-react'
 * import { parseUnits } from '@klever/connect-core'
 *
 * function KDATransfer() {
 *   const { transfer, isLoading } = useTransfer()
 *
 *   const handleTransfer = async () => {
 *     await transfer({
 *       receiver: 'klv1receiver...',
 *       amount: parseUnits('100', 6), // 100 tokens with 6 decimals
 *       kda: 'KDA-TOKEN-ID'
 *     })
 *   }
 *
 *   return (
 *     <button onClick={handleTransfer} disabled={isLoading}>
 *       Transfer KDA
 *     </button>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Uses useTransaction internally for transaction handling
 * - Automatically sets contractType to TXType.Transfer
 * - Supports both KLV and KDA token transfers
 * - All transaction state and lifecycle events are managed automatically
 */
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

/**
 * Return type for useFreeze hook
 */
export interface UseFreezeReturn {
  /** Freeze (stake) assets to create a bucket */
  freeze: (params: FreezeRequest) => Promise<TransactionSubmitResult>
  /** Boolean indicating if transaction is in progress */
  isLoading: boolean
  /** Error object if transaction failed */
  error: Error | null
  /** Transaction receipt after successful submission */
  data: TransactionReceipt | null
  /** Reset transaction state */
  reset: () => void
}

/**
 * useFreeze - Convenience hook for freeze (staking) transactions
 *
 * Simplified hook for freezing (staking) KLV or KDA tokens.
 * Creates a bucket for KLV (max 100 per user) or accumulates frozen amount for KDA.
 *
 * @param options - Optional callbacks for transaction lifecycle events
 * @returns Freeze method and transaction state
 *
 * @example Freeze KLV tokens
 * ```tsx
 * import { useFreeze } from '@klever/connect-react'
 * import { parseKLV } from '@klever/connect-core'
 *
 * function StakeButton() {
 *   const { freeze, isLoading, data } = useFreeze({
 *     onSuccess: async (receipt) => {
 *       console.log('Freeze successful!', receipt.hash)
 *       // Wait for transaction to get bucket ID
 *       const result = await receipt.wait?.()
 *       const bucketId = result?.receipts?.[0]?.bucketId
 *       console.log('Bucket created:', bucketId)
 *     }
 *   })
 *
 *   const handleStake = async () => {
 *     const result = await freeze({
 *       amount: parseKLV('100'),
 *       kda: 'KLV'
 *     })
 *     // Can also get bucket ID from result
 *     const receipt = await result.wait()
 *     const bucketId = receipt.receipts?.[0]?.bucketId
 *   }
 *
 *   return (
 *     <button onClick={handleStake} disabled={isLoading}>
 *       {isLoading ? 'Freezing...' : 'Freeze 100 KLV'}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example Freeze KDA tokens
 * ```tsx
 * import { useFreeze } from '@klever/connect-react'
 * import { parseUnits } from '@klever/connect-core'
 *
 * function FreezeKDA() {
 *   const { freeze, isLoading, error } = useFreeze()
 *
 *   const handleFreeze = async () => {
 *     await freeze({
 *       amount: parseUnits('1000', 6),
 *       kda: 'MY-KDA-TOKEN'
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleFreeze} disabled={isLoading}>
 *         Freeze KDA
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Uses useTransaction internally for transaction handling
 * - Automatically sets contractType to TXType.Freeze
 * - KLV creates buckets (32-byte hash IDs) with max 100 per user
 * - KDA accumulates frozen amount without bucket limit
 * - Adding to existing stake resets minimum unfreeze time
 * - Bucket ID available in receipt after transaction confirmation
 */
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

/**
 * Return type for useUnfreeze hook
 */
export interface UseUnfreezeReturn {
  /** Unfreeze (unstake) assets from a bucket */
  unfreeze: (params: UnfreezeRequest) => Promise<TransactionSubmitResult>
  /** Boolean indicating if transaction is in progress */
  isLoading: boolean
  /** Error object if transaction failed */
  error: Error | null
  /** Transaction receipt after successful submission */
  data: TransactionReceipt | null
  /** Reset transaction state */
  reset: () => void
}

/**
 * useUnfreeze - Convenience hook for unfreeze (unstaking) transactions
 *
 * Simplified hook for unfreezing (unstaking) KLV or KDA tokens.
 * Starts the cooldown period before withdrawal is allowed.
 *
 * @param options - Optional callbacks for transaction lifecycle events
 * @returns Unfreeze method and transaction state
 *
 * @example Unfreeze KLV bucket
 * ```tsx
 * import { useUnfreeze } from '@klever/connect-react'
 *
 * function UnstakeButton({ bucketId }) {
 *   const { unfreeze, isLoading, error } = useUnfreeze({
 *     onSuccess: () => {
 *       console.log('Unfreeze started! Wait for cooldown period.')
 *     }
 *   })
 *
 *   const handleUnfreeze = async () => {
 *     await unfreeze({
 *       kda: 'KLV',
 *       bucketId: bucketId
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleUnfreeze} disabled={isLoading}>
 *         {isLoading ? 'Unfreezing...' : 'Unfreeze KLV'}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Unfreeze KDA tokens
 * ```tsx
 * import { useUnfreeze } from '@klever/connect-react'
 *
 * function UnfreezeKDA() {
 *   const { unfreeze, isLoading, data } = useUnfreeze()
 *
 *   const handleUnfreeze = async () => {
 *     const result = await unfreeze({
 *       kda: 'MY-KDA-TOKEN'
 *       // bucketId not needed for KDA
 *     })
 *     console.log('Unfreeze initiated:', result.hash)
 *   }
 *
 *   return (
 *     <button onClick={handleUnfreeze} disabled={isLoading}>
 *       Unfreeze KDA
 *     </button>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Uses useTransaction internally for transaction handling
 * - Automatically sets contractType to TXType.Unfreeze
 * - Required before withdraw operation
 * - Starts cooldown period (varies by asset)
 * - For KLV: bucketId is required
 * - For KDA: bucketId is optional
 * - Must wait for cooldown before calling withdraw
 */
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

/**
 * Return type for useClaim hook
 */
export interface UseClaimReturn {
  /** Claim staking or FPR rewards */
  claim: (params: ClaimRequest) => Promise<TransactionSubmitResult>
  /** Boolean indicating if transaction is in progress */
  isLoading: boolean
  /** Error object if transaction failed */
  error: Error | null
  /** Transaction receipt after successful submission */
  data: TransactionReceipt | null
  /** Reset transaction state */
  reset: () => void
}

/**
 * useClaim - Convenience hook for claiming rewards
 *
 * Simplified hook for claiming staking rewards (APR) or FPR rewards.
 * Supports multiple claim types: Staking, Market, Allowance, and FPR.
 *
 * @param options - Optional callbacks for transaction lifecycle events
 * @returns Claim method and transaction state
 *
 * @example Claim staking rewards
 * ```tsx
 * import { useClaim } from '@klever/connect-react'
 *
 * function ClaimRewardsButton() {
 *   const { claim, isLoading, error, data } = useClaim({
 *     onSuccess: (receipt) => {
 *       console.log('Rewards claimed!', receipt.hash)
 *     }
 *   })
 *
 *   const handleClaim = async () => {
 *     await claim({
 *       claimType: 0, // 0 = Staking rewards
 *       id: 'KLV' // Optional asset ID
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleClaim} disabled={isLoading}>
 *         {isLoading ? 'Claiming...' : 'Claim Staking Rewards'}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *       {data && <p>Claimed! Hash: {data.hash}</p>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Claim FPR rewards
 * ```tsx
 * import { useClaim } from '@klever/connect-react'
 *
 * function ClaimFPR() {
 *   const { claim, isLoading } = useClaim()
 *
 *   const handleClaimFPR = async () => {
 *     const result = await claim({
 *       claimType: 3, // 3 = FPR rewards
 *       id: 'MY-KDA-TOKEN'
 *     })
 *     console.log('FPR claimed:', result.hash)
 *   }
 *
 *   return (
 *     <button onClick={handleClaimFPR} disabled={isLoading}>
 *       Claim FPR Rewards
 *     </button>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Uses useTransaction internally for transaction handling
 * - Automatically sets contractType to TXType.Claim
 *
 * **Claim Types:**
 * - 0 = Staking (APR-based rewards, fixed by asset owner)
 * - 1 = Market (marketplace rewards)
 * - 2 = Allowance (allowance-based claims)
 * - 3 = FPR (dynamic rewards from KDA staking deposits)
 *
 * **Reward Types:**
 * - APR: Fixed rewards based on asset's APR (owner can change anytime)
 * - FPR: Dynamic rewards based on deposits in KDA staking system
 *
 * **Parameters:**
 * - `claimType`: Required - type of claim (0-3)
 * - `id`: Optional - asset ID to claim rewards for
 */
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
