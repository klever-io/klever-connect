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
 * Helper function to create a transfer request object for the TransactionBuilder
 *
 * @param params - Transfer parameters
 * @param params.receiver - Recipient's bech32 address
 * @param params.amount - Amount to transfer in smallest units (string, number, or bigint)
 * @param params.kda - Optional asset ID (defaults to KLV if not specified)
 * @returns TransferRequest object ready to use with builder.transfer()
 *
 * @example
 * ```typescript
 * const transfer = createTransfer({
 *   receiver: 'klv1abc...',
 *   amount: '1000000',
 *   kda: 'KLV'
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1xyz...')
 *   .transfer(transfer)
 *   .build()
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
 * Used for NFT transfers that include royalty payments to creators
 *
 * @param params - Transfer parameters with royalties
 * @param params.receiver - Recipient's bech32 address
 * @param params.amount - Amount to transfer in smallest units
 * @param params.kda - Optional asset ID (typically an NFT)
 * @param params.kdaRoyalties - Optional royalties in KDA asset
 * @param params.klvRoyalties - Optional royalties in KLV
 * @returns TransferRequest object with royalties
 *
 * @example
 * ```typescript
 * const transfer = createTransferWithRoyalties({
 *   receiver: 'klv1abc...',
 *   amount: '1',
 *   kda: 'NFT-COLLECTION/NONCE-1',
 *   kdaRoyalties: '100000',
 *   klvRoyalties: '50000'
 * })
 * ```
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
 * Freezing locks assets and creates a bucket that can be delegated or used for governance
 *
 * @param params - Freeze parameters
 * @param params.amount - Amount to freeze in smallest units
 * @param params.kda - Optional asset ID to freeze (defaults to KLV)
 * @returns FreezeRequest object ready to use with builder.freeze()
 *
 * @example
 * ```typescript
 * const freeze = createFreeze({
 *   amount: '5000000',
 *   kda: 'KLV'
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1xyz...')
 *   .freeze(freeze)
 *   .build()
 * ```
 */
export function createFreeze(params: { amount: AmountLike; kda?: string }): FreezeRequest {
  return params as FreezeRequest
}

/**
 * Create an unfreeze (unstake) request
 * Unfreezing initiates the unlock period for frozen assets
 *
 * @param params - Unfreeze parameters
 * @param params.bucketId - Bucket ID to unfreeze
 * @param params.kda - Optional asset ID (required for KLV)
 * @returns UnfreezeRequest object ready to use with builder.unfreeze()
 *
 * @example
 * ```typescript
 * const unfreeze = createUnfreeze({
 *   bucketId: 'bucket-hash-123',
 *   kda: 'KLV'
 * })
 * ```
 */
export function createUnfreeze(params: { bucketId: string; kda?: string }): UnfreezeRequest {
  return params as UnfreezeRequest
}

/**
 * Create a delegate request
 * Delegates a frozen bucket to a validator for staking
 *
 * @param params - Delegate parameters
 * @param params.receiver - Validator's bech32 address
 * @param params.bucketId - Optional bucket ID to delegate
 * @returns DelegateRequest object ready to use with builder.delegate()
 *
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
 * Removes delegation from a validator, returning bucket to your control
 *
 * @param params - Undelegate parameters
 * @param params.bucketId - Bucket ID to undelegate (required)
 * @returns UndelegateRequest object ready to use with builder.undelegate()
 *
 * @example
 * ```typescript
 * const undelegate = createUndelegate({
 *   bucketId: 'bucket-hash-123'
 * })
 * ```
 */
export function createUndelegate(params: { bucketId: string }): UndelegateRequest {
  return params as UndelegateRequest
}

/**
 * Create a withdraw request
 * Withdraws available funds (staking rewards, unlocked assets, etc.)
 *
 * @param params - Withdraw parameters
 * @param params.withdrawType - Type of withdrawal (0 = staking, 1 = FPR, etc.)
 * @param params.kda - Optional asset ID to withdraw
 * @param params.amount - Optional specific amount to withdraw
 * @param params.currencyID - Optional currency ID for cross-currency withdrawals
 * @returns WithdrawRequest object ready to use with builder.withdraw()
 *
 * @example
 * ```typescript
 * const withdraw = createWithdraw({
 *   withdrawType: 0, // Staking rewards
 *   kda: 'KLV'
 * })
 * ```
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
 * Claims rewards or allocations (staking rewards, airdrops, etc.)
 *
 * @param params - Claim parameters
 * @param params.claimType - Type of claim (0 = staking rewards, 1 = market rewards, etc.)
 * @param params.id - Optional claim ID for specific claims
 * @returns ClaimRequest object ready to use with builder.claim()
 *
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
 * Fungible tokens are divisible assets like coins or tokens
 *
 * @param params - Fungible token parameters
 * @param params.name - Full name of the token
 * @param params.ticker - Short ticker symbol (e.g., "MTK")
 * @param params.ownerAddress - Owner's bech32 address
 * @param params.precision - Number of decimal places (e.g., 6 for standard tokens)
 * @param params.maxSupply - Maximum supply in smallest units
 * @param params.initialSupply - Optional initial supply to mint
 * @param params.properties - Optional token properties (mintable, burnable, etc.)
 * @returns CreateAssetRequest object ready to use with builder.createAsset()
 *
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
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .createAsset(asset)
 *   .build()
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
 * NFTs are non-fungible tokens with unique properties and metadata
 *
 * @param params - NFT collection parameters
 * @param params.name - Collection name
 * @param params.ticker - Collection ticker symbol
 * @param params.ownerAddress - Owner's bech32 address
 * @param params.logo - Optional logo URI
 * @param params.uris - Optional metadata URIs
 * @param params.properties - Optional collection properties
 * @param params.royalties - Optional royalty configuration
 * @returns CreateAssetRequest object ready to use with builder.createAsset()
 *
 * @example
 * ```typescript
 * const nftCollection = createNFTCollection({
 *   name: 'My NFT Collection',
 *   ticker: 'MYNFT',
 *   ownerAddress: 'klv1...',
 *   logo: 'ipfs://...',
 *   royalties: {
 *     address: 'klv1...',
 *     percentage: 5 // 5% royalties
 *   }
 * })
 * ```
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
 * Creates a new NFT within an existing collection
 *
 * @param params - Mint NFT parameters
 * @param params.assetId - NFT collection asset ID
 * @param params.receiver - Optional recipient address (defaults to sender)
 * @param params.uris - Optional metadata URIs for the NFT
 * @param params.mime - Optional MIME type for the NFT
 * @returns AssetTriggerRequest object for minting NFT
 *
 * @example
 * ```typescript
 * const mintNFT = createMintNFT({
 *   assetId: 'MYNFT-ABCD',
 *   receiver: 'klv1...',
 *   uris: {
 *     image: 'ipfs://...',
 *     metadata: 'ipfs://...'
 *   },
 *   mime: 'image/png'
 * })
 * ```
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
 * Permanently destroys tokens, reducing total supply
 *
 * @param params - Burn parameters
 * @param params.assetId - Asset ID to burn
 * @param params.amount - Amount to burn in smallest units
 * @returns AssetTriggerRequest object for burning tokens
 *
 * @example
 * ```typescript
 * const burn = createBurn({
 *   assetId: 'MYTOKEN-ABCD',
 *   amount: '1000000'
 * })
 * ```
 */
export function createBurn(params: { assetId: string; amount: AmountLike }): AssetTriggerRequest {
  return {
    triggerType: 1, // Burn
    ...params,
  } as AssetTriggerRequest
}

/**
 * Wipe asset (admin only)
 * Removes tokens from a specific address (admin function)
 *
 * @param params - Wipe parameters
 * @param params.assetId - Asset ID to wipe
 * @param params.receiver - Address to wipe tokens from
 * @param params.amount - Amount to wipe in smallest units
 * @returns AssetTriggerRequest object for wiping tokens
 *
 * @example
 * ```typescript
 * const wipe = createWipe({
 *   assetId: 'MYTOKEN-ABCD',
 *   receiver: 'klv1...',
 *   amount: '1000000'
 * })
 * ```
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
 * Temporarily freezes all transfers of the asset
 *
 * @param params - Pause parameters
 * @param params.assetId - Asset ID to pause
 * @returns AssetTriggerRequest object for pausing asset
 *
 * @example
 * ```typescript
 * const pause = createPause({
 *   assetId: 'MYTOKEN-ABCD'
 * })
 * ```
 */
export function createPause(params: { assetId: string }): AssetTriggerRequest {
  return {
    triggerType: 3, // Pause
    ...params,
  } as AssetTriggerRequest
}

/**
 * Resume asset (admin only)
 * Resumes transfers of a paused asset
 *
 * @param params - Resume parameters
 * @param params.assetId - Asset ID to resume
 * @returns AssetTriggerRequest object for resuming asset
 *
 * @example
 * ```typescript
 * const resume = createResume({
 *   assetId: 'MYTOKEN-ABCD'
 * })
 * ```
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
 * Create a validator node registration
 * Registers a new validator to participate in network consensus
 *
 * **Requirements:**
 * - Valid BLS public key for consensus signing
 * - Sufficient minimum stake amount
 * - Unique validator configuration
 *
 * @param params - Validator parameters
 * @param params.blsPublicKey - BLS public key for validator signing (hex format)
 * @param params.ownerAddress - Owner's bech32 address
 * @param params.commission - Commission rate percentage (0-100, e.g., 10 = 10%)
 * @param params.canDelegate - Optional: Whether delegators can stake (defaults to true)
 * @param params.rewardAddress - Optional: Separate address to receive rewards
 * @param params.maxDelegationAmount - Optional: Maximum delegation limit
 * @param params.name - Optional: Validator display name
 * @param params.logo - Optional: Logo URL or URI
 * @param params.uris - Optional: Additional URIs (website, social media, etc.)
 * @returns CreateValidatorRequest object ready to use with builder.createValidator()
 *
 * @example
 * ```typescript
 * // Create validator with full details
 * const validator = createValidator({
 *   blsPublicKey: '0xabcd1234...',
 *   ownerAddress: 'klv1...',
 *   commission: 10, // 10% commission
 *   canDelegate: true,
 *   name: 'My Validator',
 *   logo: 'https://example.com/logo.png',
 *   uris: {
 *     website: 'https://validator.example.com',
 *     twitter: 'https://twitter.com/myvalidator'
 *   }
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .createValidator(validator)
 *   .build()
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
 * Create a governance proposal for network parameter changes
 * Proposals allow the community to vote on changes to network configuration
 *
 * @param params - Proposal parameters
 * @param params.parameters - Map of parameter IDs to new values
 * @param params.description - Optional human-readable description of the proposal
 * @param params.epochsDuration - Optional duration in epochs for voting period
 * @returns ProposalRequest object ready to use with builder
 *
 * @example
 * ```typescript
 * // Create proposal to change network parameters
 * const proposal = createProposal({
 *   parameters: {
 *     1: '1000000', // Parameter 1: New value
 *     5: '500000'   // Parameter 5: New value
 *   },
 *   description: 'Increase minimum stake amount',
 *   epochsDuration: 10 // 10 epochs for voting
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .addContract({ contractType: 13, ...proposal })
 *   .build()
 * ```
 */
export function createProposal(params: {
  parameters: Record<number, string>
  description?: string
  epochsDuration?: number
}): ProposalRequest {
  return params as ProposalRequest
}

/**
 * Vote on a governance proposal
 * Allows token holders to vote on active proposals
 *
 * **Vote Types:**
 * - 0: Abstain (don't vote)
 * - 1: Yes (approve proposal)
 * - 2: No (reject proposal)
 *
 * @param params - Vote parameters
 * @param params.proposalId - ID of the proposal to vote on
 * @param params.type - Vote type (0 = abstain, 1 = yes, 2 = no)
 * @param params.amount - Optional stake amount to weight the vote
 * @returns VoteRequest object ready to use with builder.vote()
 *
 * @example
 * ```typescript
 * // Vote yes on proposal
 * const vote = createVote({
 *   proposalId: 5,
 *   type: 1, // Yes
 *   amount: '1000000' // Optional voting weight
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .vote(vote)
 *   .build()
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
 * Set account name to create a human-readable identifier
 * Account names provide an easy-to-remember alias for addresses
 *
 * @param params - Account name parameters
 * @param params.name - Desired account name (must be unique on the network)
 * @returns SetAccountNameRequest object ready to use with builder
 *
 * @example
 * ```typescript
 * // Set a readable account name
 * const setName = createSetAccountName({
 *   name: 'myaccount'
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .addContract({ contractType: 15, ...setName })
 *   .build()
 *
 * // After setting, users can send to "myaccount" instead of "klv1..."
 * ```
 */
export function createSetAccountName(params: { name: string }): SetAccountNameRequest {
  return params as SetAccountNameRequest
}

// ============================================================================
// Smart Contract Operations
// ============================================================================

/**
 * Create a smart contract call
 * Interacts with deployed smart contracts on the Klever blockchain
 *
 * @param params - Smart contract call parameters
 * @param params.address - Contract's bech32 address
 * @param params.scType - Contract call type (0 = deploy, 1 = invoke, etc.)
 * @param params.callValue - Optional KLV or KDA amounts to send with the call
 * @returns SmartContractRequest object ready to use with builder.smartContract()
 *
 * @example
 * ```typescript
 * const scCall = createSmartContractCall({
 *   address: 'klv1contract...',
 *   scType: 1, // Invoke
 *   callValue: {
 *     'KLV': '1000000'
 *   }
 * })
 *
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .smartContract(scCall)
 *   .data(['functionName', 'arg1', 'arg2'])
 *   .build()
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
 * KLV uses 6 decimal places, so 1 KLV = 1,000,000 smallest units
 *
 * @param amount - Amount in KLV (e.g., "1.5" or 1.5)
 * @returns Amount in smallest units as string (e.g., "1500000")
 *
 * @example
 * ```typescript
 * const amount = toKLVUnits('1.5') // Returns '1500000'
 * const amount2 = toKLVUnits(10) // Returns '10000000'
 * const amount3 = toKLVUnits('0.000001') // Returns '1'
 * ```
 */
export function toKLVUnits(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.floor(num * 1_000_000).toString()
}

/**
 * Convert smallest units to KLV
 * Converts from 6-decimal smallest units back to human-readable KLV
 *
 * @param amount - Amount in smallest units (string, number, or bigint)
 * @returns Amount in KLV as string (e.g., "1.5")
 *
 * @example
 * ```typescript
 * const klv = fromKLVUnits('1500000') // Returns '1.5'
 * const klv2 = fromKLVUnits(10000000) // Returns '10'
 * const klv3 = fromKLVUnits(1n) // Returns '0.000001'
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
 * Useful for custom KDA tokens with different decimal places
 *
 * @param amount - Amount in human-readable format
 * @param precision - Number of decimal places (e.g., 6 for KLV, 8 for some tokens)
 * @returns Amount in smallest units as string
 *
 * @example
 * ```typescript
 * // Convert token with 8 decimals
 * const amount = toUnits('1.5', 8) // Returns '150000000'
 *
 * // Convert token with 2 decimals
 * const amount2 = toUnits('100.50', 2) // Returns '10050'
 * ```
 */
export function toUnits(amount: string | number, precision: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  const multiplier = Math.pow(10, precision)
  return Math.floor(num * multiplier).toString()
}

/**
 * Convert from units with custom precision
 * Converts smallest units back to human-readable format for custom tokens
 *
 * @param amount - Amount in smallest units
 * @param precision - Number of decimal places
 * @returns Amount in human-readable format as string
 *
 * @example
 * ```typescript
 * // Convert token with 8 decimals
 * const readable = fromUnits('150000000', 8) // Returns '1.5'
 *
 * // Convert token with 2 decimals
 * const readable2 = fromUnits('10050', 2) // Returns '100.5'
 * ```
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
