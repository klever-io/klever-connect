/**
 * Receipt Parser Utilities
 *
 * Type-safe parsers for extracting data from transaction receipts.
 * Works with all transaction types and provides clean, typed outputs.
 */

import type { ITransactionResponse } from '../types/api-types'

// ============================================================================
// Internal Receipt Types (from blockchain API)
// ============================================================================

interface FreezeReceipt extends Record<string, unknown> {
  type: number
  typeString?: string
  bucketId?: string
  bucketID?: string
  value?: number | string
  amount?: number | string
  assetId?: string
  from?: string
  cID?: number
}

interface UnfreezeReceipt extends Record<string, unknown> {
  type: number
  typeString?: string
  bucketId?: string
  bucketID?: string
  assetId?: string
  availableEpoch?: string | number
  from?: string
  cID?: number
}

interface WithdrawReceipt extends Record<string, unknown> {
  type: number
  typeString?: string
  amount?: number | string
  assetId?: string
  from?: string
  cID?: number
}

interface DelegateReceipt extends Record<string, unknown> {
  type: number
  typeString?: string
  bucketId?: string
  bucketID?: string
  delegate?: string
  amountDelegated?: string | number
  from?: string
  cID?: number
  availableEpoch?: string | number
}

interface TransferReceipt extends Record<string, unknown> {
  type: number
  typeString?: string
  from?: string
  to?: string
  value?: number | string
  amount?: number | string
  assetId?: string
  assetType?: string
  collection?: string
  nonce?: string
  marketplaceId?: string
  orderId?: string
  cID?: number
}

// ============================================================================
// Parsed Receipt Data Types
// ============================================================================

export interface FreezeReceiptData {
  /** Bucket ID created (32-byte hash for KLV, KDA ID for other assets) */
  bucketId: string
  /** Amount frozen */
  amount: bigint
  /** Asset ID (KDA) */
  kda: string
  /** All freeze operations if multiple assets were frozen */
  freezes?:
    | Array<{
        bucketId: string
        amount: bigint
        kda: string
      }>
    | undefined
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

export interface UnfreezeReceiptData {
  /** Bucket ID that was unfrozen */
  bucketId: string
  /** Asset ID (KDA) */
  kda: string
  /** Timestamp when withdrawal will be available */
  availableAt?: number | undefined
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

export interface ClaimReceiptData {
  /** Array of claimed rewards */
  rewards: Array<{
    /** Asset ID */
    kda: string
    /** Amount claimed */
    amount: bigint
  }>
  /** Total amount claimed (sum of all rewards) */
  totalClaimed: bigint
  /** Claim type (0 = Staking, 1 = Market, 2 = Allowance, 3 = FPR) */
  claimType?: number | undefined
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

export interface WithdrawReceiptData {
  /** Amount withdrawn */
  amount: bigint
  /** Asset ID (KDA) */
  kda: string
  /** Withdraw type */
  withdrawType?: number | undefined
  /** All withdrawals if multiple */
  withdrawals?:
    | Array<{
        amount: bigint
        kda: string
      }>
    | undefined
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

export interface DelegateReceiptData {
  /** Validator address delegated to */
  validator: string
  /** Bucket ID that was delegated */
  bucketId: string
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

export interface UndelegateReceiptData {
  /** Bucket ID that was undelegated */
  bucketId: string
  /** Timestamp when funds will be available for withdrawal */
  availableAt?: number | undefined
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

export interface TransferReceiptData {
  /** Sender address */
  sender: string
  /** Recipient address */
  receiver: string
  /** Amount transferred */
  amount: bigint
  /** Asset ID (KDA) - defaults to KLV */
  kda: string
  /** All transfers if multiple assets were transferred */
  transfers?:
    | Array<{
        sender: string
        receiver: string
        amount: bigint
        kda: string
      }>
    | undefined
  /** Raw receipt for additional data */
  raw: ITransactionResponse
}

// ============================================================================
// Parser Error
// ============================================================================

export class ReceiptParseError extends Error {
  constructor(
    message: string,
    public readonly receipt?: ITransactionResponse,
    public readonly receiptType?: string,
  ) {
    super(message)
    this.name = 'ReceiptParseError'
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely extract string from receipt data
 */
function getReceiptString(receipt: ITransactionResponse, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = receipt

  for (const part of parts) {
    const match = part.match(/^(\w+)(?:\[(\d+)\])?$/)
    if (!match) return undefined

    const [, key, index] = match
    if (!key) return undefined

    // Type guard to check if current is an object with string keys
    if (typeof current !== 'object' || current === null) {
      return undefined
    }

    current = (current as Record<string, unknown>)[key]

    if (index !== undefined) {
      if (!Array.isArray(current)) {
        return undefined
      }
      current = current[parseInt(index)]
    }

    if (current === undefined || current === null) {
      return undefined
    }
  }

  return String(current)
}

/**
 * Safely extract number from receipt data
 */
function getReceiptNumber(receipt: ITransactionResponse, path: string): number | undefined {
  const value = getReceiptString(receipt, path)
  if (!value) return undefined

  const num = Number(value)
  return isNaN(num) ? undefined : num
}

// ============================================================================
// Receipt Parsers
// ============================================================================

/**
 * Parse freeze transaction receipt to extract bucketId and amount
 */
function freeze(receipt: ITransactionResponse): FreezeReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError('No receipts found in freeze transaction', receipt, 'freeze')
  }

  // Find freeze receipts (type 3 or typeString 'Freeze')
  const freezeReceipts = receipt.receipts.filter(
    (r): r is FreezeReceipt => r.type === 3 || r.typeString === 'Freeze',
  )

  if (freezeReceipts.length === 0) {
    throw new ReceiptParseError('No freeze receipt found', receipt, 'freeze')
  }

  // Parse first freeze receipt (primary)
  const firstFreeze = freezeReceipts[0]
  if (!firstFreeze) {
    throw new ReceiptParseError('No freeze receipt found', receipt, 'freeze')
  }
  const bucketId = firstFreeze.bucketId || firstFreeze.bucketID

  if (!bucketId) {
    throw new ReceiptParseError('BucketId not found in freeze receipt', receipt, 'freeze')
  }

  const amount = BigInt(firstFreeze.value || firstFreeze.amount || 0)
  const kda = firstFreeze.assetId || 'KLV'

  // Parse all freeze operations if multiple
  const freezes =
    freezeReceipts.length > 1
      ? freezeReceipts.map((r) => ({
          bucketId: r.bucketId || r.bucketID || '',
          amount: BigInt(r.value || r.amount || 0),
          kda: r.assetId || 'KLV',
        }))
      : undefined

  return {
    bucketId,
    amount,
    kda,
    freezes,
    raw: receipt,
  }
}

/**
 * Parse unfreeze transaction receipt
 */
function unfreeze(receipt: ITransactionResponse): UnfreezeReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError('No receipts found in unfreeze transaction', receipt, 'unfreeze')
  }

  // Find unfreeze receipt (type 4 or typeString 'Unfreeze')
  const unfreezeReceipt = receipt.receipts.find(
    (r): r is UnfreezeReceipt => r.type === 4 || r.typeString === 'Unfreeze',
  )

  if (!unfreezeReceipt) {
    throw new ReceiptParseError('No unfreeze receipt found', receipt, 'unfreeze')
  }

  const bucketId = unfreezeReceipt.bucketId || unfreezeReceipt.bucketID

  if (!bucketId) {
    throw new ReceiptParseError('BucketId not found in unfreeze receipt', receipt, 'unfreeze')
  }

  const kda = unfreezeReceipt.assetId || 'KLV'
  const availableAt = unfreezeReceipt.availableEpoch
    ? Number(unfreezeReceipt.availableEpoch)
    : undefined

  return {
    bucketId,
    kda,
    availableAt,
    raw: receipt,
  }
}

/**
 * Parse claim transaction receipt to extract rewards
 */
function claim(receipt: ITransactionResponse): ClaimReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError('No receipts found in claim transaction', receipt, 'claim')
  }

  const rewards = receipt.receipts.map((r) => {
    const assetId = typeof r['assetId'] === 'string' ? r['assetId'] : 'KLV'
    const amount =
      typeof r['amount'] === 'number' || typeof r['amount'] === 'string' ? BigInt(r['amount']) : 0n
    return {
      kda: assetId,
      amount,
    }
  })

  const totalClaimed = rewards.reduce((sum, r) => sum + r.amount, 0n)

  const claimType = getReceiptNumber(receipt, 'contract[0].parameter.claimType')

  return {
    rewards,
    totalClaimed,
    claimType,
    raw: receipt,
  }
}

/**
 * Parse withdraw transaction receipt
 */
function withdraw(receipt: ITransactionResponse): WithdrawReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError('No receipts found in withdraw transaction', receipt, 'withdraw')
  }

  // Find withdraw receipts (type 18 or typeString 'Withdraw')
  const withdrawReceipts = receipt.receipts.filter(
    (r): r is WithdrawReceipt => r.type === 18 || r.typeString === 'Withdraw',
  )

  if (withdrawReceipts.length === 0) {
    throw new ReceiptParseError('No withdraw receipt found', receipt, 'withdraw')
  }

  // Parse first withdraw receipt (primary)
  const firstWithdraw = withdrawReceipts[0]
  if (!firstWithdraw) {
    throw new ReceiptParseError('No withdraw receipt found', receipt, 'withdraw')
  }
  const amount = BigInt(firstWithdraw.amount || 0)
  const kda = firstWithdraw.assetId || 'KLV'

  const withdrawType = getReceiptNumber(receipt, 'contract[0].parameter.withdrawType')

  // Parse all withdrawals if multiple
  const withdrawals =
    withdrawReceipts.length > 1
      ? withdrawReceipts.map((r) => ({
          amount: BigInt(r.amount || 0),
          kda: r.assetId || 'KLV',
        }))
      : undefined

  return {
    amount,
    kda,
    withdrawType,
    withdrawals,
    raw: receipt,
  }
}

/**
 * Parse delegate transaction receipt
 */
function delegate(receipt: ITransactionResponse): DelegateReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError('No receipts found in delegate transaction', receipt, 'delegate')
  }

  // Find delegate receipt (type 7 or typeString 'Delegate')
  const delegateReceipt = receipt.receipts.find(
    (r): r is DelegateReceipt => r.type === 7 || r.typeString === 'Delegate',
  )

  if (!delegateReceipt) {
    throw new ReceiptParseError('No delegate receipt found', receipt, 'delegate')
  }

  const validator =
    delegateReceipt.delegate ||
    getReceiptString(receipt, 'contract[0].parameter.toAddress') ||
    getReceiptString(receipt, 'contract[0].parameter.receiver')

  if (!validator) {
    throw new ReceiptParseError(
      'Validator address not found in delegate receipt',
      receipt,
      'delegate',
    )
  }

  const bucketId = delegateReceipt.bucketId || delegateReceipt.bucketID || ''

  return {
    validator,
    bucketId,
    raw: receipt,
  }
}

/**
 * Parse undelegate transaction receipt
 * Note: Undelegate creates a Delegate receipt (type 7) with empty delegate field
 */
function undelegate(receipt: ITransactionResponse): UndelegateReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError(
      'No receipts found in undelegate transaction',
      receipt,
      'undelegate',
    )
  }

  // Find delegate receipt (undelegate creates a delegate receipt with empty delegate field)
  const delegateReceipt = receipt.receipts.find(
    (r): r is DelegateReceipt => r.type === 7 || r.typeString === 'Delegate',
  )

  if (!delegateReceipt) {
    throw new ReceiptParseError(
      'No delegate receipt found in undelegate transaction',
      receipt,
      'undelegate',
    )
  }

  const bucketId = delegateReceipt.bucketId || delegateReceipt.bucketID

  if (!bucketId) {
    throw new ReceiptParseError('BucketId not found in undelegate receipt', receipt, 'undelegate')
  }

  const availableAt = delegateReceipt.availableEpoch
    ? Number(delegateReceipt.availableEpoch)
    : undefined

  return {
    bucketId,
    availableAt,
    raw: receipt,
  }
}

/**
 * Parse transfer transaction receipt
 */
function transfer(receipt: ITransactionResponse): TransferReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ReceiptParseError('No receipts found in transfer transaction', receipt, 'transfer')
  }

  // Find transfer receipts (type 0 or typeString 'Transfer')
  const transferReceipts = receipt.receipts.filter(
    (r): r is TransferReceipt => r.type === 0 || r.typeString === 'Transfer',
  )

  if (transferReceipts.length === 0) {
    throw new ReceiptParseError('No transfer receipt found', receipt, 'transfer')
  }

  // Parse first transfer receipt (primary)
  const firstTransfer = transferReceipts[0]
  if (!firstTransfer) {
    throw new ReceiptParseError('No transfer receipt found', receipt, 'transfer')
  }
  const sender = firstTransfer.from || receipt.sender
  const receiver = firstTransfer.to

  if (!receiver) {
    throw new ReceiptParseError(
      'Receiver address not found in transfer receipt',
      receipt,
      'transfer',
    )
  }

  const amount = BigInt(firstTransfer.value || firstTransfer.amount || 0)
  const kda = firstTransfer.assetId || 'KLV'

  // Parse all transfers if multiple
  const transfers =
    transferReceipts.length > 1
      ? transferReceipts.map((r) => ({
          sender: r.from || receipt.sender,
          receiver: r.to || '',
          amount: BigInt(r.value || r.amount || 0),
          kda: r.assetId || 'KLV',
        }))
      : undefined

  return {
    sender,
    receiver,
    amount,
    kda,
    transfers,
    raw: receipt,
  }
}

// ============================================================================
// Main Parser Export
// ============================================================================

/**
 * Receipt parser utilities
 *
 * Provides type-safe parsing of transaction receipts with hybrid support:
 * - Simple API: Primary/first receipt for common single-operation cases
 * - Array fields: All operations when multiple receipts exist
 *
 * @example
 * ```ts
 * import { parseReceipt } from '@klever/connect-provider'
 *
 * // Single freeze
 * const result = await freeze(100000, 'KLV')
 * const receipt = await result.wait()
 * const { bucketId, amount, kda } = parseReceipt.freeze(receipt)
 * console.log(`Created bucket ${bucketId} with ${amount} ${kda}`)
 *
 * // Multiple transfers in one transaction
 * const transferResult = await transferMultiple(...)
 * const transferReceipt = await transferResult.wait()
 * const { sender, receiver, amount, kda, transfers } = parseReceipt.transfer(transferReceipt)
 * console.log(`Primary: ${sender} → ${receiver}: ${amount} ${kda}`)
 * if (transfers) {
 *   console.log(`Total transfers: ${transfers.length}`)
 *   transfers.forEach(t => console.log(`  ${t.sender} → ${t.receiver}: ${t.amount} ${t.kda}`))
 * }
 *
 * // Claim rewards (always multiple)
 * const claimResult = await claim(0)
 * const claimReceipt = await claimResult.wait()
 * const { rewards, totalClaimed } = parseReceipt.claim(claimReceipt)
 * console.log(`Claimed ${totalClaimed} across ${rewards.length} assets`)
 * ```
 */
export const parseReceipt = {
  freeze,
  unfreeze,
  claim,
  withdraw,
  delegate,
  undelegate,
  transfer,
}

// Re-export error for convenience
export { ReceiptParseError as ParseError }
