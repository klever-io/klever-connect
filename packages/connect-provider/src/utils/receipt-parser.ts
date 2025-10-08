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
 * Safely extract string value from receipt data using dot notation path
 *
 * Supports:
 * - Nested objects: 'contract.parameter.receiver'
 * - Array access: 'contract[0].parameter'
 *
 * @param receipt - Transaction receipt to extract from
 * @param path - Dot notation path (e.g., 'contract[0].parameter.claimType')
 * @returns Extracted string value or undefined if path not found
 *
 * @example
 * ```typescript
 * const receiver = getReceiptString(receipt, 'contract[0].parameter.receiver')
 * const claimType = getReceiptString(receipt, 'contract[0].parameter.claimType')
 * ```
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
 * Safely extract numeric value from receipt data using dot notation path
 *
 * Converts string values to numbers automatically.
 *
 * @param receipt - Transaction receipt to extract from
 * @param path - Dot notation path (e.g., 'contract[0].parameter.withdrawType')
 * @returns Extracted number or undefined if path not found or not a valid number
 *
 * @example
 * ```typescript
 * const withdrawType = getReceiptNumber(receipt, 'contract[0].parameter.withdrawType')
 * const claimType = getReceiptNumber(receipt, 'contract[0].parameter.claimType')
 * ```
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
 * Parse freeze transaction receipt to extract bucket ID and frozen amount
 *
 * Freeze receipts contain:
 * - bucketId: Unique identifier for the frozen bucket (32-byte hash)
 * - amount: Amount that was frozen
 * - kda: Asset ID (KDA) that was frozen
 *
 * Supports multi-freeze transactions where multiple assets are frozen in one transaction.
 *
 * @param receipt - Transaction receipt from a freeze operation
 * @returns Parsed freeze data with bucket ID, amount, and asset details
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * // Single freeze
 * const tx = await provider.getTransaction(freezeTxHash)
 * const { bucketId, amount, kda } = parseReceipt.freeze(tx)
 * console.log(`Frozen ${amount} ${kda} in bucket ${bucketId}`)
 *
 * // Multiple freezes
 * const { bucketId, amount, kda, freezes } = parseReceipt.freeze(tx)
 * console.log(`Primary freeze: ${amount} ${kda}`)
 * if (freezes) {
 *   freezes.forEach(f => console.log(`  ${f.amount} ${f.kda} -> ${f.bucketId}`))
 * }
 * ```
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
 * Parse unfreeze transaction receipt to extract bucket and availability details
 *
 * Unfreeze receipts contain:
 * - bucketId: ID of the bucket that was unfrozen
 * - kda: Asset ID that was unfrozen
 * - availableAt: Timestamp when funds can be withdrawn (if applicable)
 *
 * @param receipt - Transaction receipt from an unfreeze operation
 * @returns Parsed unfreeze data with bucket ID and availability info
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * const tx = await provider.getTransaction(unfreezeTxHash)
 * const { bucketId, kda, availableAt } = parseReceipt.unfreeze(tx)
 * console.log(`Unfrozen ${kda} from bucket ${bucketId}`)
 * if (availableAt) {
 *   const date = new Date(availableAt * 1000)
 *   console.log(`Available for withdrawal at: ${date.toISOString()}`)
 * }
 * ```
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
 * Parse claim transaction receipt to extract reward details
 *
 * Claim receipts contain:
 * - rewards: Array of all claimed rewards by asset
 * - totalClaimed: Sum of all claimed amounts
 * - claimType: Type of claim (0=Staking, 1=Market, 2=Allowance, 3=FPR)
 *
 * Claims always involve multiple receipts (one per asset claimed).
 *
 * @param receipt - Transaction receipt from a claim operation
 * @returns Parsed claim data with rewards array and totals
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * const tx = await provider.getTransaction(claimTxHash)
 * const { rewards, totalClaimed, claimType } = parseReceipt.claim(tx)
 *
 * console.log(`Claimed ${totalClaimed} total across ${rewards.length} assets`)
 * rewards.forEach(r => {
 *   console.log(`  ${r.amount} ${r.kda}`)
 * })
 *
 * const claimTypes = ['Staking', 'Market', 'Allowance', 'FPR']
 * console.log(`Claim type: ${claimTypes[claimType || 0]}`)
 * ```
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
 * Parse withdraw transaction receipt to extract withdrawal details
 *
 * Withdraw receipts contain:
 * - amount: Amount withdrawn
 * - kda: Asset ID that was withdrawn
 * - withdrawType: Type of withdrawal operation
 *
 * Supports multi-withdraw transactions.
 *
 * @param receipt - Transaction receipt from a withdraw operation
 * @returns Parsed withdraw data with amount and asset details
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * const tx = await provider.getTransaction(withdrawTxHash)
 * const { amount, kda, withdrawType } = parseReceipt.withdraw(tx)
 * console.log(`Withdrew ${amount} ${kda}`)
 *
 * // Multiple withdrawals
 * const { amount, kda, withdrawals } = parseReceipt.withdraw(tx)
 * if (withdrawals) {
 *   console.log(`Total withdrawals: ${withdrawals.length}`)
 *   withdrawals.forEach(w => console.log(`  ${w.amount} ${w.kda}`))
 * }
 * ```
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
 * Parse delegate transaction receipt to extract delegation details
 *
 * Delegate receipts contain:
 * - validator: Address of the validator that was delegated to
 * - bucketId: Bucket ID that was delegated
 *
 * @param receipt - Transaction receipt from a delegate operation
 * @returns Parsed delegation data with validator and bucket ID
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * const tx = await provider.getTransaction(delegateTxHash)
 * const { validator, bucketId } = parseReceipt.delegate(tx)
 * console.log(`Delegated bucket ${bucketId} to validator ${validator}`)
 * ```
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
 * Parse undelegate transaction receipt to extract undelegation details
 *
 * Undelegate receipts contain:
 * - bucketId: Bucket ID that was undelegated
 * - availableAt: Timestamp when funds can be withdrawn
 *
 * Note: Undelegate creates a Delegate receipt (type 7) with empty delegate field
 *
 * @param receipt - Transaction receipt from an undelegate operation
 * @returns Parsed undelegation data with bucket ID and availability info
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * const tx = await provider.getTransaction(undelegateTxHash)
 * const { bucketId, availableAt } = parseReceipt.undelegate(tx)
 * console.log(`Undelegated bucket ${bucketId}`)
 * if (availableAt) {
 *   const date = new Date(availableAt * 1000)
 *   console.log(`Available for withdrawal: ${date.toISOString()}`)
 * }
 * ```
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
 * Parse transfer transaction receipt to extract transfer details
 *
 * Transfer receipts contain:
 * - sender: Address that sent the assets
 * - receiver: Address that received the assets
 * - amount: Amount transferred
 * - kda: Asset ID that was transferred (defaults to KLV)
 *
 * Supports multi-transfer transactions where multiple transfers occur.
 *
 * @param receipt - Transaction receipt from a transfer operation
 * @returns Parsed transfer data with sender, receiver, and amount
 * @throws {ReceiptParseError} If receipt is missing or invalid
 *
 * @example
 * ```typescript
 * // Single transfer
 * const tx = await provider.getTransaction(transferTxHash)
 * const { sender, receiver, amount, kda } = parseReceipt.transfer(tx)
 * console.log(`${sender} sent ${amount} ${kda} to ${receiver}`)
 *
 * // Multiple transfers
 * const { sender, receiver, amount, kda, transfers } = parseReceipt.transfer(tx)
 * console.log(`Primary: ${sender} -> ${receiver}: ${amount} ${kda}`)
 * if (transfers) {
 *   console.log(`Total transfers: ${transfers.length}`)
 *   transfers.forEach(t => {
 *     console.log(`  ${t.sender} -> ${t.receiver}: ${t.amount} ${t.kda}`)
 *   })
 * }
 * ```
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
