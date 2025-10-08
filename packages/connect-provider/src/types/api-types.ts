import type { TransactionHash } from '@klever/connect-core'

export interface IAccount {
  address: string
  balance: bigint
  nonce: number
  assets?: IAssetBalance[]
}

/** Asset type enum matching KDAData_EnumAssetType from blockchain */
export enum AssetType {
  Fungible = 0,
  NonFungible = 1,
  SemiFungible = 2,
}

/** Staking interest type enum matching StakingData_EnumInterestType */
export enum StakingInterestType {
  APRI = 0, // Annual Percentage Rate Interest
  FPRI = 1, // Flexible Percentage Rate Interest
}

/** User's last claim information for a KDA */
export interface UserKDALastClaim {
  timestamp: number
  epoch: number
}

/** User's bucket information for staking */
export interface UserKDABucket {
  id: string
  stakedAt: number
  stakedEpoch: number
  unstakedEpoch: number
  balance: bigint
  delegation: string
  validatorName: string
}

/**
 * Complete asset balance information from blockchain
 * Matches AccountKDA structure from Go backend
 */
export interface IAssetBalance {
  /** Address of the account holding this asset */
  address: string
  /** Asset ID (KDA ID) */
  assetId: string
  /** Collection ID for NFTs */
  collection?: string | undefined
  /** NFT nonce for specific NFT instances */
  nftNonce?: number | undefined
  /** Human-readable asset name */
  assetName: string
  /** Asset type (Fungible, NonFungible, SemiFungible) */
  assetType: AssetType
  /** Total balance in smallest units */
  balance: bigint
  /** Number of decimal places for display */
  precision: number
  /** Frozen balance (staked) in smallest units */
  frozenBalance: bigint
  /** Unfrozen balance (available after unstaking cooldown) */
  unfrozenBalance: bigint
  /** Last claim information for rewards */
  lastClaim: UserKDALastClaim
  /** Staking buckets for this asset */
  buckets: UserKDABucket[]
  /** NFT metadata */
  metadata?: string | undefined
  /** MIME type for NFT content */
  mime?: string | undefined
  /** Marketplace ID if listed for sale */
  marketplaceId?: string | undefined
  /** Order ID if active order exists */
  orderId?: string | undefined
  /** Staking interest type (APR or FPR) */
  stakingType: StakingInterestType
}

export interface IBalance {
  address: string
  token: string
  amount: bigint
  decimals: number
}

export interface IBroadcastResult {
  hash: string
  code?: string
  message?: string
}

export interface IBulkBroadcastResult {
  hashes: string[]
  code?: string
  message?: string
}

export interface IContractQueryParams {
  ScAddress: string
  FuncName: string
  Arguments?: string[]
}

export interface IContractQueryResult {
  data?: {
    returnData?: string[]
    returnCode?: string
    returnMessage?: string
    gasRemaining?: bigint
    gasRefund?: bigint
  }
  error?: string
  code?: string
}

export interface IFaucetResult {
  txHash: string
  status: string
}

/**
 * Contract data from API responses (e.g., getTransaction)
 * Represents contracts in mined/historical transactions returned by the Klever API.
 *
 * Note: This is for READ operations (API → Client).
 * For WRITE operations (building new transactions), use ContractRequestData instead.
 *
 * @property type - Contract type number (0=Transfer, 4=Freeze, etc.)
 * @property typeString - Human-readable type name, added by the indexer (e.g., "Transfer")
 * @property parameter - Contract-specific data (untyped for historical transactions)
 */
export interface IContractData {
  type: number
  typeString?: string
  parameter: Record<string, unknown> | ISCData
}

export interface ICallValueData {
  assetId: string
  amount: bigint
}

export interface ISCData {
  address: string
  scType: number
  callValue?: ICallValueData[]
  input?: string
}

export enum TransactionStatus {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
  Invalid = 'invalid',
}

export interface ITransactionLog {
  address: string
  contractId?: number
  timestamp?: number
  events: ILogEvent[]
}

export interface ILogEvent {
  address: string
  identifier: string
  topics: string[]
  data: string[]
}

export interface IFees {
  KAppFee: number
  BandwidthFee: number
  TotalFee: number
}

export interface IFeesResponse {
  kAppFee: number
  bandwidthFee: number
  gasEstimated: number
  safetyMargin: number
  gasMultiplier: number
  returnMessage: string
  kdaFee: {
    kda?: Uint8Array
    amount?: number
  }
}

export interface IReceipt {
  type?: number
  typeString?: string
  cID?: number
  [key: string]: unknown
}

/**
 * Transaction response from the API/Indexer
 * This represents a transaction that has been processed and indexed
 * Contains parsed data with human-readable addresses and contract info
 */
export interface ITransactionResponse {
  hash: string
  blockNum: number
  sender: string
  nonce: number
  timestamp: number
  kAppFee: number
  bandwidthFee: number
  totalFee: number
  status: TransactionStatus
  resultCode?: string
  version: number
  chainID: string
  signature: string[]
  contract?: IContractData[]
  data?: string[]
  receipts?: IReceipt[]
  logs?: ITransactionLog
  hasLogs?: boolean
  hasOperations?: boolean
}

/**
 * Result returned when submitting a transaction
 * Contains the transaction hash and optionally the full transaction data
 */
export interface TransactionSubmitResult {
  /** Transaction hash */
  hash: TransactionHash
  /** Transaction status */
  status: 'pending' | 'success' | 'failed'
  /** Raw transaction data that was submitted (proto Transaction format from @klever/connect-transactions) */
  transaction?: unknown
  /** Wait for transaction to be mined/confirmed */
  wait?: () => Promise<ITransactionResponse>
}

/**
 * Klever API Response Types
 */

// Common Response Wrapper
export interface ApiResponse<T> {
  data: T
  pagination?: Pagination
  error: string
  code: string
}

export interface Pagination {
  self: number
  next: number
  previous: number
  perPage: number
  totalPages: number
  totalRecords: number
}

// Account/Address Response
export interface AddressResponse {
  account: {
    address: string
    nonce: number
    rootHash?: string
    balance: number
    frozenBalance: number
    unfrozenBalance: number
    allowance: number
    permissions: string[]
    timestamp: number
    codeHash?: string
    codeMetadata: string
    assets: Record<string, ApiAssetBalance>
  }
}

/**
 * Asset balance as returned by the API
 * Matches AccountKDA structure from Go backend
 */
export interface ApiAssetBalance {
  address: string
  assetId: string
  collection?: string
  nftNonce?: number
  assetName: string
  assetType: number
  balance: number
  precision: number
  frozenBalance: number
  unfrozenBalance: number
  lastClaim: {
    timestamp: number
    epoch: number
  }
  buckets: Array<{
    id: string
    stakeAt: number
    stakedEpoch: number
    unstakedEpoch: number
    balance: number
    delegation: string
    validatorName: string
  }>
  metadata?: string
  mime?: string
  marketplaceId?: string
  orderId?: string
  stakingType: number
}

// Transaction Response
export interface ITransactionListResponse {
  transactions: ITransactionResponse[]
}

// Transaction API Response wrapper
export interface ITransactionApiResponse {
  transaction: ITransactionResponse
}

// Broadcast Response (Node API)
// Matches the API response: { data: { txsHashes: [...], count: N }, error: "", code: "" }
export interface IBroadcastResponse {
  data?: {
    txHash?: string
    txsHashes?: string[]
    count?: number
  }
  error?: string
  code?: string
  message?: string
}

// Block Response (from API/Indexer)
export interface IBlockResponse {
  hash: string
  nonce: number
  parentHash: string
  timestamp: number
  slot: number
  epoch: number
  isEpochStart: boolean
  prevEpochStartSlot: number
  size: number
  sizeTxs: number
  virtualBlockSize: number
  txRootHash: string
  trieRoot: string
  validatorsTrieRoot: string
  kappsTrieRoot: string
  producerSignature: string
  signature: string
  prevRandSeed: string
  randSeed: string
  txCount: number
  blockRewards: number
  stakingRewards: number
  txHashes: string[]
  validators: string[]
  softwareVersion: string
  chainID: string
  reserved: string
  producerBLS: string
  transactions: ITransactionResponse[] | null
  producerName: string
  producerOwnerAddress: string
  producerLogo: string
}

// Asset/Token Response
export interface IAssetResponse {
  assetId: string
  assetName: string
  assetType: string
  ownerAddress: string
  logo?: string
  uris?: Record<string, string>
  precision: number
  circulatingSupply: string
  maxSupply: string
  marketCap?: string
  verified?: boolean
  hidden?: boolean
  attributes?: Record<string, unknown>
}

// Network Info Response
export interface INetworkResponse {
  nodeVersion: string
  apiVersion: string
  chainID: string
  currentBlockHeight: number
  currentBlockHash: string
  genesisBlockHash: string
  protocolVersion: string
}

// Staking/Delegation Response
export interface IStakingResponse {
  frozenBalance: number
  unfrozenBalance: number
  claimableBalance: number
  delegate?: {
    to: string
    amount: number
  }
}

// Validator Response
export interface IValidatorResponse {
  address: string
  name?: string
  rating: number
  jailed: boolean
  totalStake: string
  selfStake: string
  delegatedStake: string
  commission: number
  maxDelegation: string
  website?: string
  logo?: string
  details?: string
}

// Contract Query Response
export interface IContractQueryResponse {
  data?: {
    returnData?: string[]
    returnCode?: string
    returnMessage?: string
    gasRemaining?: number
    gasRefund?: number
  }
  error?: string
  code?: string
}

// Faucet Response
export interface IFaucetResponse {
  data?: {
    txHash: string
    status: string
  }
  error?: string
  code?: string
}

// Market/Exchange Data
export interface IMarketResponse {
  marketId: string
  baseAsset: string
  quoteAsset: string
  lastPrice: string
  priceChange24h: string
  volume24h: string
  high24h: string
  low24h: string
}

export interface ITypedValue {
  type: string
  value: string
}
