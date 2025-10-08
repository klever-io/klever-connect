/**
 * Contract request types for Klever blockchain transactions
 * These types represent the contract parameters sent to the Klever API for building transactions
 *
 * Each contract type (Transfer, Freeze, etc.) has a corresponding Request interface
 * that defines the parameters needed for that specific operation.
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Amount in smallest units (raw value)
 * - bigint: Native JavaScript bigint (recommended)
 * - number: JavaScript number (limited to safe integer range)
 * - string: String representation of raw value (e.g., "10000000" for 10 KLV)
 *
 * Note: All values are treated as raw (smallest units). No automatic conversion.
 * For human-readable values, use parseKLV() to convert before passing to SDK.
 *
 * @example
 * ```typescript
 * // All these are 10 KLV (raw value = 10000000):
 * amount: 10000000n           // bigint (recommended)
 * amount: 10000000            // number
 * amount: "10000000"          // string
 *
 * // Convert human-readable to raw:
 * import { parseKLV } from '@klever/connect-core'
 * amount: parseKLV("10")      // Returns 10000000n (10 KLV)
 * amount: parseKLV("10.5")    // Returns 10500000n (10.5 KLV)
 * ```
 */
export type AmountLike = number | bigint | string

// ============================================================================
// Transfer
// ============================================================================

export interface TransferRequest {
  receiver: string
  amount: AmountLike
  kda?: string
  kdaRoyalties?: AmountLike
  klvRoyalties?: AmountLike
}

// ============================================================================
// Asset Creation & Management
// ============================================================================

export interface RoyaltyData {
  amount: AmountLike
  percentage: number
}

export interface RoyaltySplitInfo {
  percentTransferPercentage?: number
  percentTransferFixed?: number
  percentMarketPercentage?: number
  percentMarketFixed?: number
  percentITOPercentage?: number
  percentITOFixed?: number
}

export interface RoyaltiesInfo {
  address: string
  transferPercentage?: RoyaltyData[]
  transferFixed?: AmountLike
  marketPercentage?: number
  marketFixed?: AmountLike
  itoPercentage?: number
  itoFixed?: AmountLike
  splitRoyalties?: Record<string, RoyaltySplitInfo>
}

export interface PropertiesInfo {
  canFreeze?: boolean
  canWipe?: boolean
  canPause?: boolean
  canMint?: boolean
  canBurn?: boolean
  canChangeOwner?: boolean
  canAddRoles?: boolean
  limitTransfer?: boolean
}

export interface AttributesInfo {
  isPaused?: boolean
  isNFTMintStopped?: boolean
  isRoyaltiesChangeStopped?: boolean
  isNFTMetadataChangeStopped?: boolean
}

export interface StakingInfo {
  interestType: number
  apr: number
  minEpochsToClaim: number
  minEpochsToUnstake: number
  minEpochsToWithdraw: number
}

export interface RolesInfo {
  address: string
  hasRoleMint?: boolean
  hasRoleSetITOPrices?: boolean
  hasRoleDeposit?: boolean
  hasRoleTransfer?: boolean
}

export interface CreateAssetRequest {
  type: number
  name: string
  ticker: string
  ownerAddress: string
  adminAddress?: string
  logo?: string
  uris?: Record<string, string>
  precision: number
  initialSupply?: AmountLike
  maxSupply: AmountLike
  royalties?: RoyaltiesInfo
  properties?: PropertiesInfo
  attributes?: AttributesInfo
  staking?: StakingInfo
  roles?: RolesInfo[]
}

export interface KDAPoolInfo {
  active: boolean
  adminAddress: string
  fRatioKLV: AmountLike
  fRatioKDA: AmountLike
}

export interface AssetTriggerRequest {
  triggerType: number
  assetId: string
  receiver?: string
  amount?: AmountLike
  mime?: string
  logo?: string
  value?: AmountLike
  uris?: Record<string, string>
  role?: RolesInfo
  staking?: StakingInfo
  royalties?: RoyaltiesInfo
  kdaPool?: KDAPoolInfo
}

// ============================================================================
// Validator
// ============================================================================

export interface CreateValidatorRequest {
  blsPublicKey: string
  ownerAddress: string
  rewardAddress?: string
  canDelegate?: boolean
  commission: number
  maxDelegationAmount?: AmountLike
  logo?: string
  uris?: Record<string, string>
  name?: string
}

export interface ValidatorConfigRequest {
  blsPublicKey: string
  rewardAddress?: string
  canDelegate?: boolean
  commission?: number
  maxDelegationAmount?: AmountLike
  logo?: string
  uris?: Record<string, string>
  name?: string
}

// ============================================================================
// Staking Operations
// ============================================================================

export interface FreezeRequest {
  amount: AmountLike
  kda?: string
}

export interface UnfreezeRequest {
  kda: string
  bucketId?: string // Only required for KLV
}

export interface DelegateRequest {
  receiver: string
  bucketId?: string
}

export interface UndelegateRequest {
  bucketId: string
}

export interface WithdrawRequest {
  kda?: string
  withdrawType: number
  amount?: AmountLike
  currencyID?: string
}

export interface ClaimRequest {
  claimType: number
  id?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UnjailRequest {
  // Empty - no parameters needed
}

// ============================================================================
// Governance
// ============================================================================

export interface ProposalRequest {
  parameters: Record<number, string>
  description?: string
  epochsDuration?: number
}

export interface VoteRequest {
  type: number
  proposalId: number
  amount?: AmountLike
}

// ============================================================================
// ITO (Initial Token Offering)
// ============================================================================

export interface PackItem {
  amount: AmountLike
  price: AmountLike
}

export interface PackInfo {
  packs: PackItem[]
}

export interface WhitelistInfo {
  limit: AmountLike
}

export interface ConfigITORequest {
  kda: string
  receiverAddress?: string
  status?: number
  maxAmount?: AmountLike
  packInfo?: Record<string, PackInfo>
  defaultLimitPerAddress?: AmountLike
  whitelistStatus?: number
  whitelistInfo?: Record<string, WhitelistInfo>
  whitelistStartTime?: AmountLike
  whitelistEndTime?: AmountLike
  startTime?: AmountLike
  endTime?: AmountLike
}

export interface ITOTriggerRequest {
  triggerType: number
  kda: string
  receiverAddress?: string
  status?: number
  maxAmount?: AmountLike
  packInfo?: Record<string, PackInfo>
  defaultLimitPerAddress?: AmountLike
  whitelistStatus?: number
  whitelistInfo?: Record<string, WhitelistInfo>
  whitelistStartTime?: AmountLike
  whitelistEndTime?: AmountLike
  startTime?: AmountLike
  endTime?: AmountLike
}

export interface SetITOPricesRequest {
  kda: string
  packInfo: Record<string, PackInfo>
}

// ============================================================================
// Marketplace
// ============================================================================

export interface BuyRequest {
  buyType: number
  id: string
  currencyId?: string
  amount?: AmountLike
  currencyAmount?: AmountLike
}

export interface SellRequest {
  marketType: number
  marketplaceId: string
  assetId: string
  currencyId?: string
  price: AmountLike
  reservePrice?: AmountLike
  endTime?: AmountLike
}

export interface CancelMarketOrderRequest {
  orderId: string
}

export interface CreateMarketplaceRequest {
  name: string
  referralAddress?: string
  referralPercentage?: number
}

export interface ConfigMarketplaceRequest {
  marketplaceId: string
  name?: string
  referralAddress?: string
  referralPercentage?: number
}

// ============================================================================
// Account Management
// ============================================================================

export interface SetAccountNameRequest {
  name: string
}

export interface SignerRequest {
  address: string
  weight: AmountLike
}

export interface PermissionRequest {
  type: number
  permissionName: string
  threshold: AmountLike
  operations: string
  signers: SignerRequest[]
}

export interface UpdateAccountPermissionRequest {
  permissions: PermissionRequest[]
}

export interface DepositRequest {
  depositType: number
  kda?: string
  currencyId?: string
  amount: AmountLike
}

// ============================================================================
// Smart Contracts
// ============================================================================

export interface SmartContractRequest {
  scType: number
  address: string
  callValue?: Record<string, AmountLike>
}

// ============================================================================
// Contract Request Data (matching Go API)
// ============================================================================

/**
 * Contract request data - represents a single contract/operation to be sent in a transaction
 * Matches the Go API structure: { type: number, parameter: <request-data> }
 * A transaction can contain multiple contract requests (e.g., transfer + freeze)
 */
export type ContractRequestData =
  | ({ contractType: 0 } & TransferRequest)
  | ({ contractType: 1 } & CreateAssetRequest)
  | ({ contractType: 2 } & CreateValidatorRequest)
  | ({ contractType: 3 } & ValidatorConfigRequest)
  | ({ contractType: 4 } & FreezeRequest)
  | ({ contractType: 5 } & UnfreezeRequest)
  | ({ contractType: 6 } & DelegateRequest)
  | ({ contractType: 7 } & UndelegateRequest)
  | ({ contractType: 8 } & WithdrawRequest)
  | ({ contractType: 9 } & ClaimRequest)
  | ({ contractType: 10 } & UnjailRequest)
  | ({ contractType: 11 } & AssetTriggerRequest)
  | ({ contractType: 12 } & SetAccountNameRequest)
  | ({ contractType: 13 } & ProposalRequest)
  | ({ contractType: 14 } & VoteRequest)
  | ({ contractType: 15 } & ConfigITORequest)
  | ({ contractType: 16 } & SetITOPricesRequest)
  | ({ contractType: 17 } & BuyRequest)
  | ({ contractType: 18 } & SellRequest)
  | ({ contractType: 19 } & CancelMarketOrderRequest)
  | ({ contractType: 20 } & CreateMarketplaceRequest)
  | ({ contractType: 21 } & ConfigMarketplaceRequest)
  | ({ contractType: 22 } & UpdateAccountPermissionRequest)
  | ({ contractType: 23 } & DepositRequest)
  | ({ contractType: 24 } & ITOTriggerRequest)
  | ({ contractType: 63 } & SmartContractRequest)
