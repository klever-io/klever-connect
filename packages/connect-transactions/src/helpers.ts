/**
 * Helper functions for creating common Klever transactions
 * These provide a simple, function-based API as an alternative to the builder pattern
 */

import type {
  TransferRequest,
  FreezeRequest,
  UnfreezeRequest,
  DelegateRequest,
  UndelegateRequest,
  WithdrawRequest,
  ClaimRequest,
  CreateAssetRequest,
  AssetTriggerRequest,
  CreateValidatorRequest,
  VoteRequest,
  ProposalRequest,
  SetAccountNameRequest,
  SmartContractRequest,
  AmountLike,
} from '@klever/connect-provider'

// ============================================================================
// Transfer Operations
// ============================================================================

/**
 * Create a simple transfer request
 * @example
 * ```typescript
 * const transfer = createTransfer({
 *   receiver: 'klv1abc...',
 *   amount: '1000000',
 *   kda: 'KLV'
 * })
 * ```
 */
export function createTransfer(params: {
  receiver: string
  amount: AmountLike
  kda?: string
}): TransferRequest {
  const req: TransferRequest = {
    receiver: params.receiver,
    amount: params.amount,
  }
  if (params.kda !== undefined) req.kda = params.kda
  return req
}

/**
 * Create a transfer with royalties
 */
export function createTransferWithRoyalties(params: {
  receiver: string
  amount: AmountLike
  kda?: string
  kdaRoyalties?: AmountLike
  klvRoyalties?: AmountLike
}): TransferRequest {
  const req: TransferRequest = {
    receiver: params.receiver,
    amount: params.amount,
  }
  if (params.kda !== undefined) req.kda = params.kda
  if (params.kdaRoyalties !== undefined) req.kdaRoyalties = params.kdaRoyalties
  if (params.klvRoyalties !== undefined) req.klvRoyalties = params.klvRoyalties
  return req
}

// ============================================================================
// Staking Operations
// ============================================================================

/**
 * Create a freeze (stake) request
 * @example
 * ```typescript
 * const freeze = createFreeze({
 *   amount: '5000000',
 *   kda: 'KLV'
 * })
 * ```
 */
export function createFreeze(params: { amount: AmountLike; kda?: string }): FreezeRequest {
  return params as FreezeRequest
}

/**
 * Create an unfreeze (unstake) request
 */
export function createUnfreeze(params: { bucketId: string; kda?: string }): UnfreezeRequest {
  return params as UnfreezeRequest
}

/**
 * Create a delegate request
 * @example
 * ```typescript
 * const delegate = createDelegate({
 *   receiver: 'klv1validator...',
 *   bucketId: 'bucket123'
 * })
 * ```
 */
export function createDelegate(params: { receiver: string; bucketId?: string }): DelegateRequest {
  return params as DelegateRequest
}

/**
 * Create an undelegate request
 */
export function createUndelegate(params: { bucketId: string }): UndelegateRequest {
  return params as UndelegateRequest
}

/**
 * Create a withdraw request
 */
export function createWithdraw(params: {
  withdrawType: number
  kda?: string
  amount?: AmountLike
  currencyID?: string
}): WithdrawRequest {
  return params as WithdrawRequest
}

/**
 * Create a claim request
 * @example
 * ```typescript
 * const claim = createClaim({
 *   claimType: 0, // Staking rewards
 *   id: 'claim123'
 * })
 * ```
 */
export function createClaim(params: { claimType: number; id?: string }): ClaimRequest {
  return params as ClaimRequest
}

// ============================================================================
// Asset Operations
// ============================================================================

/**
 * Create a basic fungible token (FT)
 * @example
 * ```typescript
 * const asset = createFungibleToken({
 *   name: 'My Token',
 *   ticker: 'MTK',
 *   ownerAddress: 'klv1...',
 *   precision: 6,
 *   maxSupply: '1000000000000',
 *   initialSupply: '100000000000'
 * })
 * ```
 */
export function createFungibleToken(params: {
  name: string
  ticker: string
  ownerAddress: string
  precision: number
  maxSupply: AmountLike
  initialSupply?: AmountLike
  properties?: CreateAssetRequest['properties']
}): CreateAssetRequest {
  return {
    type: 0, // Fungible Token
    ...params,
  } as CreateAssetRequest
}

/**
 * Create an NFT collection
 */
export function createNFTCollection(params: {
  name: string
  ticker: string
  ownerAddress: string
  logo?: string
  uris?: Record<string, string>
  properties?: CreateAssetRequest['properties']
  royalties?: CreateAssetRequest['royalties']
}): CreateAssetRequest {
  return {
    type: 1, // NFT
    precision: 0, // NFTs have no decimals
    maxSupply: 0, // Unlimited for NFTs
    ...params,
  } as CreateAssetRequest
}

/**
 * Mint NFT
 */
export function createMintNFT(params: {
  assetId: string
  receiver?: string
  uris?: Record<string, string>
  mime?: string
}): AssetTriggerRequest {
  return {
    triggerType: 0, // Mint
    ...params,
  } as AssetTriggerRequest
}

/**
 * Burn asset
 */
export function createBurn(params: { assetId: string; amount: AmountLike }): AssetTriggerRequest {
  return {
    triggerType: 1, // Burn
    ...params,
  } as AssetTriggerRequest
}

/**
 * Wipe asset (admin only)
 */
export function createWipe(params: {
  assetId: string
  receiver: string
  amount: AmountLike
}): AssetTriggerRequest {
  return {
    triggerType: 2, // Wipe
    ...params,
  } as AssetTriggerRequest
}

/**
 * Pause asset (admin only)
 */
export function createPause(params: { assetId: string }): AssetTriggerRequest {
  return {
    triggerType: 3, // Pause
    ...params,
  } as AssetTriggerRequest
}

/**
 * Resume asset (admin only)
 */
export function createResume(params: { assetId: string }): AssetTriggerRequest {
  return {
    triggerType: 4, // Resume
    ...params,
  } as AssetTriggerRequest
}

// ============================================================================
// Validator Operations
// ============================================================================

/**
 * Create a validator
 * @example
 * ```typescript
 * const validator = createValidator({
 *   blsPublicKey: '0x...',
 *   ownerAddress: 'klv1...',
 *   commission: 10, // 10%
 *   canDelegate: true
 * })
 * ```
 */
export function createValidator(params: {
  blsPublicKey: string
  ownerAddress: string
  commission: number
  canDelegate?: boolean
  rewardAddress?: string
  maxDelegationAmount?: AmountLike
  name?: string
  logo?: string
  uris?: Record<string, string>
}): CreateValidatorRequest {
  return params as CreateValidatorRequest
}

// ============================================================================
// Governance Operations
// ============================================================================

/**
 * Create a governance proposal
 */
export function createProposal(params: {
  parameters: Record<number, string>
  description?: string
  epochsDuration?: number
}): ProposalRequest {
  return params as ProposalRequest
}

/**
 * Vote on a proposal
 * @example
 * ```typescript
 * const vote = createVote({
 *   proposalId: 5,
 *   type: 1, // Vote yes
 *   amount: '1000000' // Optional stake amount
 * })
 * ```
 */
export function createVote(params: {
  proposalId: number
  type: number
  amount?: AmountLike
}): VoteRequest {
  return params as VoteRequest
}

// ============================================================================
// Account Management
// ============================================================================

/**
 * Set account name
 */
export function createSetAccountName(params: { name: string }): SetAccountNameRequest {
  return params as SetAccountNameRequest
}

// ============================================================================
// Smart Contract Operations
// ============================================================================

/**
 * Create a smart contract call
 * @example
 * ```typescript
 * const scCall = createSmartContractCall({
 *   address: 'klv1contract...',
 *   scType: 0,
 *   callValue: {
 *     'KLV': '1000000'
 *   }
 * })
 * ```
 */
export function createSmartContractCall(params: {
  address: string
  scType: number
  callValue?: Record<string, AmountLike>
}): SmartContractRequest {
  return params as SmartContractRequest
}

// ============================================================================
// Amount Conversion Helpers
// ============================================================================

/**
 * Convert KLV to the smallest unit (6 decimals)
 * @example
 * ```typescript
 * const amount = toKLVUnits('1.5') // Returns '1500000'
 * ```
 */
export function toKLVUnits(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.floor(num * 1_000_000).toString()
}

/**
 * Convert smallest units to KLV
 * @example
 * ```typescript
 * const klv = fromKLVUnits('1500000') // Returns '1.5'
 * ```
 */
export function fromKLVUnits(amount: string | number | bigint): string {
  const num =
    typeof amount === 'bigint'
      ? Number(amount)
      : typeof amount === 'string'
        ? parseInt(amount)
        : amount
  return (num / 1_000_000).toString()
}

/**
 * Convert amount with custom precision
 */
export function toUnits(amount: string | number, precision: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  const multiplier = Math.pow(10, precision)
  return Math.floor(num * multiplier).toString()
}

/**
 * Convert from units with custom precision
 */
export function fromUnits(amount: string | number | bigint, precision: number): string {
  const num =
    typeof amount === 'bigint'
      ? Number(amount)
      : typeof amount === 'string'
        ? parseInt(amount)
        : amount
  const divisor = Math.pow(10, precision)
  return (num / divisor).toString()
}
