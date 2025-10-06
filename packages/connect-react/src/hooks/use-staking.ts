import type {
  FreezeRequest,
  UnfreezeRequest,
  DelegateRequest,
  UndelegateRequest,
  ClaimRequest,
  WithdrawRequest,
  AmountLike,
  TransactionSubmitResult,
  ContractRequestData,
} from '@klever/connect-provider'
import { TXType } from '@klever/connect-core'
import { useCallback } from 'react'

import { useTransaction } from './use-transaction'
import type { TransactionCallbacks } from './use-transaction'

export interface UseStakingReturn {
  /**
   * Freeze (stake) assets to create a bucket
   * - For KLV: Creates a bucket with 32-byte hash bucketID (max 100 buckets per user)
   * - For other KDA: Accumulates frozen amount (no bucket limit)
   * - Adding to existing stake resets the minimum unfreeze time
   *
   * @param amount - Amount to freeze (number, bigint, or string)
   * @param kda - Optional KDA ID (defaults to KLV if not provided)
   *
   * @returns TransactionSubmitResult with hash, status, transaction, and wait() method:
   * ```ts
   * const { freeze } = useStaking()
   *
   * const result = await freeze(100000, 'KLV')
   * console.log('Transaction hash:', result.hash)
   *
   * // Wait for confirmation and get bucketId
   * const receipt = await result.wait()
   * const bucketId = receipt.receipts?.[0]?.bucketId || receipt.receipts?.[0]?.data?.[0]
   * console.log('Bucket created:', bucketId)
   * ```
   */
  freeze: (amount: AmountLike, kda?: string) => Promise<TransactionSubmitResult>

  /**
   * Unfreeze (unstake) assets from a bucket
   * - Starts the cooldown period before withdrawal is allowed
   * - Required before withdraw operation
   * @param kda - KDA ID (required)
   * @param bucketId - Bucket ID (optional, only needed for KLV)
   */
  unfreeze: (kda: string, bucketId?: string) => Promise<TransactionSubmitResult>

  /**
   * Delegate KLV bucket to a validator
   * - Only KLV can be delegated (generates bucketID)
   * - Each bucket has fixed amount and single delegation
   * - Bucket must be frozen before delegation
   * @param receiver - Validator address
   * @param bucketId - Optional bucket ID (if not provided, creates new bucket)
   */
  delegate: (receiver: string, bucketId?: string) => Promise<TransactionSubmitResult>

  /**
   * Undelegate KLV from a validator bucket
   * @param bucketId - Bucket ID to undelegate from
   */
  undelegate: (bucketId: string) => Promise<TransactionSubmitResult>

  /**
   * Claim staking rewards
   * - APR type: Fixed rewards based on asset's APR (owner can change APR anytime)
   * - FPR type: Dynamic rewards based on deposits in KDA staking system
   * @param claimType - Type of claim (0 = Staking, 1 = Market, 2 = Allowance, 3 = FPR)
   * @param id - Optional claim ID
   */
  claim: (claimType: number, id?: string) => Promise<TransactionSubmitResult>

  /**
   * Withdraw unfrozen assets
   * - Must call unfreeze first and wait for cooldown period
   * - Completes the unstaking process
   * @param withdrawType - Type of withdrawal
   * @param options - Optional withdrawal parameters (kda, amount, currencyID)
   */
  withdraw: (
    withdrawType: number,
    options?: { kda?: string; amount?: AmountLike; currencyID?: string },
  ) => Promise<TransactionSubmitResult>

  /** Transaction loading state */
  isLoading: boolean

  /** Transaction error state */
  error: Error | null

  /**
   * Transaction receipt data
   * After freeze(), the bucketId will be available in data.receipts[0] after transaction confirms
   */
  data: unknown

  /** Reset transaction state */
  reset: () => void
}

/**
 * React hook for complete staking workflow
 *
 * This hook composes multiple staking operations with a simplified API.
 * It uses `useTransaction` internally as the single source of truth.
 *
 * **Architecture:**
 * - Individual hooks (`useFreeze`, `useUnfreeze`, `useClaim`) - For single operations
 * - `useStaking` (this hook) - Convenience wrapper for complete staking workflow
 * - Both use the same underlying `useTransaction.sendTransaction`
 *
 * Complete staking flow:
 * 1. freeze() - Stake assets to create bucket
 * 2. delegate() - Delegate KLV bucket to validator (KLV only)
 * 3. claim() - Claim rewards (APR or FPR based)
 * 4. undelegate() - Undelegate from validator
 * 5. unfreeze() - Start cooldown period
 * 6. withdraw() - Withdraw after cooldown
 *
 * @param options - Optional callbacks for success/error events
 * @returns Staking operations and transaction state
 *
 * @example
 * ```tsx
 * function StakingComponent() {
 *   const staking = useStaking({
 *     onSuccess: (receipt) => console.log('Success!', receipt),
 *     onError: (err) => console.error('Failed:', err)
 *   })
 *
 *   // Step 1: Freeze KLV to create bucket
 *   await staking.freeze(100000)
 *
 *   // Step 2: Delegate bucket to validator
 *   await staking.delegate('klv1validator...', 'bucket-id')
 *
 *   // Step 3: Claim rewards
 *   await staking.claim(0)
 *
 *   // Step 4: Unfreeze to start cooldown
 *   await staking.unfreeze('bucket-id')
 *
 *   // Step 5: Withdraw after cooldown
 *   await staking.withdraw(0)
 * }
 * ```
 */
export function useStaking(options?: TransactionCallbacks): UseStakingReturn {
  // Use useTransaction as the single source of truth for state
  const { sendTransaction, isLoading, error, data, reset } = useTransaction(options)

  // Convenience wrapper for freeze with simpler API
  const freeze = useCallback(
    async (amount: AmountLike, kda?: string): Promise<TransactionSubmitResult> => {
      const freezeRequest: FreezeRequest = {
        amount,
        ...(kda && { kda }),
      }

      return await sendTransaction({
        contractType: TXType.Freeze as 4,
        ...freezeRequest,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  // Convenience wrapper for unfreeze with simpler API
  const unfreeze = useCallback(
    async (kda: string, bucketId?: string): Promise<TransactionSubmitResult> => {
      const unfreezeRequest: UnfreezeRequest = {
        kda,
        ...(bucketId && { bucketId }),
      }

      return await sendTransaction({
        contractType: TXType.Unfreeze as 5,
        ...unfreezeRequest,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  // Delegate transaction
  const delegate = useCallback(
    async (receiver: string, bucketId?: string): Promise<TransactionSubmitResult> => {
      const delegateRequest: DelegateRequest = {
        receiver,
        ...(bucketId && { bucketId }),
      }

      return await sendTransaction({
        contractType: TXType.Delegate as 6,
        ...delegateRequest,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  // Undelegate transaction
  const undelegate = useCallback(
    async (bucketId: string): Promise<TransactionSubmitResult> => {
      const undelegateRequest: UndelegateRequest = {
        bucketId,
      }

      return await sendTransaction({
        contractType: TXType.Undelegate as 7,
        ...undelegateRequest,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  // Convenience wrapper for claim with simpler API
  const claim = useCallback(
    async (claimType: number, id?: string): Promise<TransactionSubmitResult> => {
      const claimRequest: ClaimRequest = {
        claimType,
        ...(id && { id }),
      }

      return await sendTransaction({
        contractType: TXType.Claim as 9,
        ...claimRequest,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  // Withdraw transaction
  const withdraw = useCallback(
    async (
      withdrawType: number,
      options?: { kda?: string; amount?: AmountLike; currencyID?: string },
    ): Promise<TransactionSubmitResult> => {
      const withdrawRequest: WithdrawRequest = {
        withdrawType,
        ...options,
      }

      return await sendTransaction({
        contractType: TXType.Withdraw as 8,
        ...withdrawRequest,
      } as ContractRequestData)
    },
    [sendTransaction],
  )

  return {
    freeze,
    unfreeze,
    delegate,
    undelegate,
    claim,
    withdraw,
    isLoading,
    error,
    data,
    reset,
  }
}
