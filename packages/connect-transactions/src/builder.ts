import { ValidationError } from '@klever/connect-core'
import type {
  IProvider,
  BuildTransactionRequest,
  TransferRequest,
  FreezeRequest,
  UnfreezeRequest,
  DelegateRequest,
  UndelegateRequest,
  WithdrawRequest,
  ClaimRequest,
  CreateAssetRequest,
  CreateValidatorRequest,
  VoteRequest,
  SmartContractRequest,
  ContractRequestData,
} from '@klever/connect-provider'
import { isValidAddress } from '@klever/connect-core'
import { Transaction } from './transaction'

import { bech32Decode, base64Encode } from '@klever/connect-encoding'
import type { AmountLike } from '@klever/connect-provider'
import type { IKDAFee } from '@klever/connect-encoding'

/**
 * Build call options
 * All fields are optional - will use builder's state if not provided
 */
export interface BuildCallOptions {
  /** Value to send with transaction (e.g., { KLV: parseKLV('1') }) */
  value?: Record<string, bigint>
  /** Chain ID for offline transaction building */
  chainId?: string
  /** Sender address */
  sender?: string
  /** Nonce for offline transaction building */
  nonce?: number
  /** Fees for offline transaction building */
  fees?: {
    kAppFee: number
    bandwidthFee: number
  }
  /** KDA fee for offline transaction building */
  kdaFee?: { kda: string; amount: AmountLike }
  /** Permission ID for the transaction */
  permissionId?: number
  /** Transaction data (for smart contract calls) */
  data?: string[]
}

/**
 * TransactionBuilder - Fluent API for building Klever blockchain transactions
 *
 * Supports three build modes:
 * 1. buildRequest() - Create request object for node endpoint
 * 2. buildProto(options) - Build proto offline (client-side)
 * 3. build() - Build using node endpoint (requires provider)
 *
 * @example
 * ```typescript
 * // Chainable building and signing
 * const tx = await TransactionBuilder.create(provider)
 *   .sender('klv1...')
 *   .transfer({ receiver: 'klv1...', amount: '1000000' })
 *   .build()
 *
 * await tx.sign(privateKey)
 * const hash = await provider.sendRawTransaction(tx.toHex())
 *
 * // Node-assisted building
 * const provider = new KleverProvider({ network: 'mainnet' })
 * const tx = await new TransactionBuilder(provider)
 *   .sender('klv1...')
 *   .transfer({ receiver: 'klv1...', amount: '1000000' })
 *   .build()
 *
 * // Offline building
 * const tx = new TransactionBuilder()
 *   .transfer({ receiver: 'klv1...', amount: '1000000' })
 *   .buildProto({
 *     sender: 'klv1...',
 *     nonce: 123,
 *     fees: { kAppFee: 500000, bandwidthFee: 100000 }
 *   })
 * ```
 */
export class TransactionBuilder {
  private contracts: ContractRequestData[] = []
  private _chainId?: string // Default to provider's network if available
  private _sender?: string
  private _nonce?: number
  private _kdaFee?: { kda: string; amount: AmountLike }
  private _permissionId?: number
  private _data?: string[]

  constructor(private provider?: IProvider) {}

  /**
   * Create a new TransactionBuilder with provider (static factory)
   * Provides a cleaner API for chainable transaction building
   *
   * @example
   * ```typescript
   * const tx = await TransactionBuilder.create(provider)
   *   .sender(address)
   *   .transfer({ receiver, amount })
   *   .build()
   *
   * await tx.sign(privateKey)
   * const hash = await provider.sendRawTransaction(tx.toHex())
   * ```
   */
  static create(provider?: IProvider): TransactionBuilder {
    return new TransactionBuilder(provider)
  }

  /**
   * Get the provider instance
   */
  getProvider(): IProvider | undefined {
    return this.provider
  }

  /**
   * Set the provider instance
   */
  setProvider(provider: IProvider): this {
    this.provider = provider
    return this
  }

  /**
   * Set chain ID (overrides provider's network if set)
   * The chain ID identifies which Klever network to use (e.g., "100" for mainnet)
   *
   * @param chainId - Chain ID string (e.g., "100" for mainnet, "101" for testnet)
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * const tx = TransactionBuilder.create()
   *   .setChainId('100')
   *   .sender('klv1...')
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .buildProto({ nonce: 1, fees: { kAppFee: 500000, bandwidthFee: 100000 } })
   * ```
   */
  setChainId(chainId: string): this {
    this._chainId = chainId
    return this
  }

  /**
   * Set sender address for the transaction
   *
   * @param address - Bech32 encoded Klever address (e.g., "klv1...")
   * @returns This builder instance for chaining
   * @throws {ValidationError} If address format is invalid
   *
   * @example
   * ```typescript
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5')
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .build()
   * ```
   */
  sender(address: string): this {
    if (!isValidAddress(address)) {
      throw new ValidationError(`Invalid sender address: ${address}`, { address })
    }
    this._sender = address
    return this
  }

  /**
   * Set nonce manually for offline transaction building
   * The nonce is a sequential counter that prevents transaction replay attacks.
   * Each account has its own nonce that increments with every transaction.
   *
   * **When to use:**
   * - Offline transaction building (required with buildProto())
   * - Manual nonce management for batch transactions
   * - Testing or debugging specific scenarios
   *
   * **Getting current nonce:**
   * Use `provider.getAccount(address)` to get the current nonce from the network
   *
   * @param nonce - Transaction nonce (must be non-negative)
   * @returns This builder instance for chaining
   * @throws {ValidationError} If nonce is negative
   *
   * @example
   * ```typescript
   * // Manual nonce for offline building
   * const tx = TransactionBuilder.create()
   *   .sender('klv1...')
   *   .nonce(123)
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .buildProto({
   *     chainId: '100',
   *     fees: { kAppFee: 500000, bandwidthFee: 100000 }
   *   })
   *
   * // Get nonce from provider first
   * const account = await provider.getAccount('klv1...')
   * const tx = TransactionBuilder.create()
   *   .sender('klv1...')
   *   .nonce(account.nonce)
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .buildProto({ chainId: '100', fees: { kAppFee: 500000, bandwidthFee: 100000 } })
   * ```
   */
  nonce(nonce: number): this {
    if (nonce < 0) {
      throw new ValidationError('Nonce must be non-negative', { nonce })
    }
    this._nonce = nonce
    return this
  }

  /**
   * Set KDA fee to pay transaction fees in a custom KDA asset instead of KLV
   * By default, transactions pay fees in KLV (kAppFee + bandwidthFee).
   * This method allows paying fees in a different asset.
   *
   * **Important:**
   * - Cannot use 'KLV' as kdaFee (KLV is the default fee asset)
   * - The asset must support being used as a fee payment option
   *
   * @param fee - KDA fee configuration
   * @param fee.kda - Asset ID to use for fee payment (cannot be 'KLV')
   * @param fee.amount - Fee amount in smallest units of the KDA asset
   * @returns This builder instance for chaining
   * @throws {ValidationError} If kda is 'KLV' or amount is negative
   *
   * @example
   * ```typescript
   * // Pay fees in custom token instead of KLV
   * const tx = TransactionBuilder.create()
   *   .sender('klv1...')
   *   .kdaFee({ kda: 'MYTOKEN-ABCD', amount: '1000000' })
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .buildProto({
   *     nonce: 1,
   *     chainId: '100',
   *   })
   * ```
   */
  kdaFee(fee: { kda: string; amount: AmountLike }): this {
    if (!fee.kda) {
      throw new ValidationError('KDA fee asset ID is required')
    }
    // can`t use KLV as kdaFee (its default if not set)
    if (fee.kda === 'KLV') {
      throw new ValidationError('KDA fee cannot be KLV - use KAppFee and BandwidthFee instead', {
        assetId: fee.kda,
      })
    }

    const amount = typeof fee.amount === 'bigint' ? fee.amount : BigInt(fee.amount)
    if (amount < 0n) {
      throw new ValidationError('KDA fee amount must be non-negative', { amount })
    }
    this._kdaFee = { kda: fee.kda, amount }
    return this
  }

  /**
   * Set permission ID for multi-signature transactions
   * Permission IDs enable complex account structures with multiple signers and permissions.
   *
   * **Use cases:**
   * - Multi-signature wallets requiring multiple approvals
   * - Corporate accounts with different permission levels
   * - Smart contract interactions with specific permissions
   *
   * @param id - Permission ID number
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Transaction requiring specific permission
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .permissionId(2)
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .build()
   * ```
   */
  permissionId(id: number): this {
    this._permissionId = id
    return this
  }

  /**
   * Set transaction data for smart contract calls
   * Data is used primarily for smart contract interactions, where it contains:
   * - Function name (first element)
   * - Function arguments (remaining elements)
   *
   * **Important:**
   * - Data is automatically base64 encoded when building with buildRequest()
   * - For offline building with buildProto(), provide UTF-8 strings
   *
   * @param data - Array of strings containing function name and arguments
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Smart contract call with arguments
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .smartContract({ address: 'klv1contract...', scType: 1 })
   *   .data(['transfer', 'klv1receiver...', '1000000'])
   *   .build()
   *
   * // Multiple data fields
   * const tx = TransactionBuilder.create()
   *   .sender('klv1...')
   *   .smartContract({ address: 'klv1contract...', scType: 1 })
   *   .data(['functionName', 'arg1', 'arg2', 'arg3'])
   *   .buildProto({ nonce: 1, chainId: '100', fees: { kAppFee: 500000, bandwidthFee: 100000 } })
   * ```
   */
  data(data: string[]): this {
    this._data = data
    return this
  }

  /**
   * Add multiple build options at once
   * Convenience method to set multiple builder options in a single call.
   * This is particularly useful when working with smart contracts or offline building.
   *
   * **Note:** The `value` option is not supported here - set callValue directly in smartContract()
   *
   * @param options - Build options object
   * @param options.sender - Sender's bech32 address
   * @param options.nonce - Transaction nonce
   * @param options.kdaFee - KDA fee configuration
   * @param options.permissionId - Permission ID
   * @param options.data - Transaction data array
   * @param options.chainId - Chain ID
   * @param options.fees - Fee amounts (kAppFee and bandwidthFee) - currently not implemented
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Set multiple options at once
   * const tx = TransactionBuilder.create()
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .callOptions({
   *     sender: 'klv1...',
   *     nonce: 123,
   *     chainId: '100',
   *     permissionId: 1
   *   })
   *   .buildProto({ fees: { kAppFee: 500000, bandwidthFee: 100000 } })
   * ```
   */
  callOptions(options: BuildCallOptions): this {
    if (options.sender) {
      this.sender(options.sender)
    }
    if (options.nonce !== undefined) {
      this.nonce(options.nonce)
    }
    if (options.kdaFee) {
      this.kdaFee(options.kdaFee)
    }
    if (options.permissionId !== undefined) {
      this.permissionId(options.permissionId)
    }
    if (options.data) {
      this.data(options.data)
    }
    if (options.fees) {
      // TODO: implement fees setting
    }
    if (options.value) {
      // should be set in smart contract directly -- ignore --
    }
    return this
  }
  /**
   * Add a contract using ContractRequestData
   * Routes to the appropriate builder method based on contractType.
   * This is a generic method that automatically calls the correct specialized method.
   *
   * **Contract Types:**
   * - 0: Transfer
   * - 1: CreateAsset
   * - 2: CreateValidator
   * - 4: Freeze
   * - 5: Unfreeze
   * - 6: Delegate
   * - 7: Undelegate
   * - 8: Withdraw
   * - 9: Claim
   * - 14: Vote
   * - 63: SmartContract
   *
   * @param contract - Contract request data with contractType
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Add transfer contract directly
   * builder.addContract({
   *   contractType: 0,
   *   receiver: 'klv1...',
   *   amount: 1000000
   * })
   *
   * // Add freeze contract
   * builder.addContract({
   *   contractType: 4,
   *   amount: 5000000,
   *   kda: 'KLV'
   * })
   * ```
   */
  addContract(contract: ContractRequestData): this {
    const { contractType, ...params } = contract

    switch (contractType) {
      case 0: // Transfer
        return this.transfer(params as TransferRequest)
      case 4: // Freeze
        return this.freeze(params as FreezeRequest)
      case 5: // Unfreeze
        return this.unfreeze(params as UnfreezeRequest)
      case 6: // Delegate
        return this.delegate(params as DelegateRequest)
      case 7: // Undelegate
        return this.undelegate(params as UndelegateRequest)
      case 8: // Withdraw
        return this.withdraw(params as WithdrawRequest)
      case 9: // Claim
        return this.claim(params as ClaimRequest)
      case 1: // CreateAsset
        return this.createAsset(params as CreateAssetRequest)
      case 2: // CreateValidator
        return this.createValidator(params as CreateValidatorRequest)
      case 14: // Vote
        return this.vote(params as VoteRequest)
      case 63: // SmartContract
        return this.smartContract(params as SmartContractRequest)
      default:
        // For unsupported types, add directly to contracts array
        this.contracts.push(contract)
        return this
    }
  }

  /**
   * Add transfer contract to send KLV or KDA assets
   *
   * @param params - Transfer parameters
   * @param params.receiver - Recipient's bech32 address
   * @param params.amount - Amount to transfer in smallest units (e.g., 1000000 = 1 KLV)
   * @param params.kda - Optional asset ID to transfer (defaults to KLV if not specified)
   * @param params.kdaRoyalties - Optional KDA royalties amount
   * @param params.klvRoyalties - Optional KLV royalties amount
   * @returns This builder instance for chaining
   * @throws {ValidationError} If receiver address is invalid or amount is not positive
   *
   * @example
   * ```typescript
   * // Transfer KLV
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .transfer({
   *     receiver: 'klv1abc123...',
   *     amount: '1000000' // 1 KLV
   *   })
   *   .build()
   *
   * // Transfer custom KDA token
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .transfer({
   *     receiver: 'klv1abc123...',
   *     amount: '5000000',
   *     kda: 'MYTOKEN-ABCD'
   *   })
   *   .build()
   *
   * // Transfer with royalties (for NFTs)
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .transfer({
   *     receiver: 'klv1abc123...',
   *     amount: '1',
   *     kda: 'NFT-COLLECTION/NONCE-1',
   *     kdaRoyalties: '100000',
   *     klvRoyalties: '50000'
   *   })
   *   .build()
   * ```
   */
  transfer(params: TransferRequest): this {
    if (!isValidAddress(params.receiver)) {
      throw new ValidationError(`Invalid recipient address: ${params.receiver}`, {
        address: params.receiver,
      })
    }

    const amount = typeof params.amount === 'bigint' ? params.amount : BigInt(params.amount)

    if (amount <= 0n) {
      throw new ValidationError('Transfer amount must be positive', { amount: params.amount })
    }

    this.contracts.push({
      contractType: 0,
      receiver: params.receiver,
      amount: amount,
      ...(params.kda && { kda: params.kda }),
      ...(params.kdaRoyalties && { kdaRoyalties: params.kdaRoyalties }),
      ...(params.klvRoyalties && { klvRoyalties: params.klvRoyalties }),
    })

    return this
  }

  /**
   * Add freeze (stake) contract to lock KLV or KDA assets
   * Freezing creates a bucket that can be delegated to validators or used for governance
   *
   * @param params - Freeze parameters
   * @param params.amount - Amount to freeze in smallest units
   * @param params.kda - Optional asset ID to freeze (defaults to KLV if not specified)
   * @returns This builder instance for chaining
   * @throws {ValidationError} If amount is not positive
   *
   * @example
   * ```typescript
   * // Freeze KLV for staking
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .freeze({
   *     amount: '5000000' // 5 KLV
   *   })
   *   .build()
   *
   * // Freeze custom KDA token
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .freeze({
   *     amount: '1000000',
   *     kda: 'MYTOKEN-ABCD'
   *   })
   *   .build()
   * ```
   */
  freeze(params: FreezeRequest): this {
    const amount = typeof params.amount === 'bigint' ? params.amount : BigInt(params.amount)

    if (amount <= 0n) {
      throw new ValidationError('Freeze amount must be positive', { amount: params.amount })
    }

    this.contracts.push({
      contractType: 4,
      amount: amount,
      ...(params.kda && { kda: params.kda }),
    })

    return this
  }

  /**
   * Add unfreeze (unstake) contract to unlock frozen assets
   * Unfreezing initiates the unlocking process - assets become available after the unlock period
   *
   * @param params - Unfreeze parameters
   * @param params.kda - Asset ID to unfreeze (required)
   * @param params.bucketId - Bucket ID to unfreeze (required for KLV, optional for other assets)
   * @returns This builder instance for chaining
   * @throws {ValidationError} If kda parameter is missing
   *
   * @example
   * ```typescript
   * // Unfreeze KLV bucket
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .unfreeze({
   *     kda: 'KLV',
   *     bucketId: 'bucket-hash-123'
   *   })
   *   .build()
   *
   * // Unfreeze custom KDA token
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .unfreeze({
   *     kda: 'MYTOKEN-ABCD'
   *   })
   *   .build()
   * ```
   */
  unfreeze(params: UnfreezeRequest): this {
    if (!params.kda) {
      throw new ValidationError('KDA is required for unfreeze')
    }

    this.contracts.push({
      contractType: 5,
      kda: params.kda,
      ...(params.bucketId && { bucketId: params.bucketId }),
    })

    return this
  }

  /**
   * Add delegate contract to assign a frozen bucket to a validator
   * Delegation allows validators to use your staked KLV for consensus and earn rewards
   *
   * @param params - Delegate parameters
   * @param params.receiver - Validator's bech32 address to delegate to
   * @param params.bucketId - Optional bucket ID to delegate (if not specified, delegates all available buckets)
   * @returns This builder instance for chaining
   * @throws {ValidationError} If validator address is invalid
   *
   * @example
   * ```typescript
   * // Delegate specific bucket to validator
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .delegate({
   *     receiver: 'klv1validator123...',
   *     bucketId: 'bucket-hash-123'
   *   })
   *   .build()
   *
   * // Delegate all available buckets
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .delegate({
   *     receiver: 'klv1validator123...'
   *   })
   *   .build()
   * ```
   */
  delegate(params: DelegateRequest): this {
    if (!isValidAddress(params.receiver)) {
      throw new ValidationError(`Invalid validator address: ${params.receiver}`, {
        address: params.receiver,
      })
    }

    this.contracts.push({
      contractType: 6,
      receiver: params.receiver,
      ...(params.bucketId && { bucketId: params.bucketId }),
    })

    return this
  }

  /**
   * Add undelegate contract to remove delegation from a validator
   * Undelegation returns the bucket to your control but keeps it frozen
   *
   * @param params - Undelegate parameters
   * @param params.bucketId - Bucket ID to undelegate (required)
   * @returns This builder instance for chaining
   * @throws {ValidationError} If bucketId is missing
   *
   * @example
   * ```typescript
   * // Undelegate bucket from validator
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .undelegate({
   *     bucketId: 'bucket-hash-123'
   *   })
   *   .build()
   * ```
   */
  undelegate(params: UndelegateRequest): this {
    if (!params.bucketId) {
      throw new ValidationError('Bucket ID is required for undelegate')
    }

    this.contracts.push({
      contractType: 7,
      ...params,
    })

    return this
  }

  /**
   * Add withdraw contract to retrieve available funds
   * Used to withdraw staking rewards, unlocked frozen assets, or other withdrawable amounts
   *
   * @param params - Withdraw parameters
   * @param params.withdrawType - Type of withdrawal (0 = staking, 1 = FPR, etc.)
   * @param params.kda - Optional asset ID to withdraw
   * @param params.amount - Optional specific amount to withdraw
   * @param params.currencyID - Optional currency ID for cross-currency withdrawals
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Withdraw staking rewards
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .withdraw({
   *     withdrawType: 0 // Staking rewards
   *   })
   *   .build()
   *
   * // Withdraw specific KDA amount
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .withdraw({
   *     withdrawType: 0,
   *     kda: 'MYTOKEN-ABCD',
   *     amount: '1000000'
   *   })
   *   .build()
   * ```
   */
  withdraw(params: WithdrawRequest): this {
    this.contracts.push({
      contractType: 8,
      ...params,
    })

    return this
  }

  /**
   * Add claim contract to claim rewards or allocations
   * Used for claiming staking rewards, airdrops, or other claimable amounts
   *
   * @param params - Claim parameters
   * @param params.claimType - Type of claim (0 = staking rewards, 1 = market rewards, etc.)
   * @param params.id - Optional claim ID for specific claims
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Claim staking rewards
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .claim({
   *     claimType: 0 // Staking rewards
   *   })
   *   .build()
   *
   * // Claim specific allocation
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .claim({
   *     claimType: 1,
   *     id: 'allocation-id-123'
   *   })
   *   .build()
   * ```
   */
  claim(params: ClaimRequest): this {
    this.contracts.push({
      contractType: 9,
      ...params,
    })

    return this
  }

  /**
   * Add create asset contract to create a new token or NFT collection
   * Creates fungible tokens (FTs), non-fungible tokens (NFTs), or other asset types
   *
   * @param params - Asset creation parameters
   * @param params.type - Asset type (0 = Fungible Token, 1 = NFT, etc.)
   * @param params.name - Full name of the asset
   * @param params.ticker - Short ticker symbol
   * @param params.ownerAddress - Owner's bech32 address
   * @param params.precision - Number of decimal places (0 for NFTs)
   * @param params.maxSupply - Maximum supply in smallest units
   * @param params.initialSupply - Optional initial supply to mint
   * @param params.properties - Optional asset properties (mintable, burnable, etc.)
   * @param params.royalties - Optional royalty configuration (for NFTs)
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Create fungible token
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .createAsset({
   *     type: 0,
   *     name: 'My Token',
   *     ticker: 'MTK',
   *     ownerAddress: 'klv1...',
   *     precision: 6,
   *     maxSupply: '1000000000000',
   *     initialSupply: '100000000000'
   *   })
   *   .build()
   *
   * // Create NFT collection
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .createAsset({
   *     type: 1,
   *     name: 'My NFT Collection',
   *     ticker: 'MYNFT',
   *     ownerAddress: 'klv1...',
   *     precision: 0,
   *     maxSupply: 0,
   *     royalties: { address: 'klv1...', percentage: 5 }
   *   })
   *   .build()
   * ```
   */
  createAsset(params: CreateAssetRequest): this {
    this.contracts.push({
      contractType: 1,
      ...params,
    })

    return this
  }

  /**
   * Add create validator contract to register a new validator node
   * Validators participate in consensus and earn rewards for securing the network
   *
   * @param params - Validator creation parameters
   * @param params.blsPublicKey - BLS public key for validator signing
   * @param params.ownerAddress - Owner's bech32 address
   * @param params.commission - Commission rate percentage (e.g., 10 for 10%)
   * @param params.canDelegate - Whether delegators can stake to this validator
   * @param params.rewardAddress - Optional address to receive rewards
   * @param params.maxDelegationAmount - Optional maximum delegation amount
   * @param params.name - Optional validator name
   * @param params.logo - Optional logo URI
   * @param params.uris - Optional additional URIs (website, social media, etc.)
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Create validator node
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .createValidator({
   *     blsPublicKey: '0xabcd1234...',
   *     ownerAddress: 'klv1...',
   *     commission: 10, // 10% commission
   *     canDelegate: true,
   *     name: 'My Validator',
   *     logo: 'https://example.com/logo.png',
   *     uris: {
   *       website: 'https://validator.example.com',
   *       twitter: 'https://twitter.com/myvalidator'
   *     }
   *   })
   *   .build()
   * ```
   */
  createValidator(params: CreateValidatorRequest): this {
    this.contracts.push({
      contractType: 2,
      ...params,
    })

    return this
  }

  /**
   * Add vote contract to participate in governance proposals
   * Voting allows token holders to participate in network governance decisions
   *
   * @param params - Vote parameters
   * @param params.proposalId - ID of the proposal to vote on
   * @param params.type - Vote type (0 = abstain, 1 = yes, 2 = no)
   * @param params.amount - Optional stake amount to use for voting weight
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * // Vote yes on proposal
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .vote({
   *     proposalId: 5,
   *     type: 1, // Yes
   *     amount: '1000000' // Optional voting weight
   *   })
   *   .build()
   *
   * // Vote no on proposal
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .vote({
   *     proposalId: 5,
   *     type: 2 // No
   *   })
   *   .build()
   * ```
   */
  vote(params: VoteRequest): this {
    this.contracts.push({
      contractType: 14,
      ...params,
    })

    return this
  }

  /**
   * Add smart contract call to interact with deployed contracts
   * Enables calling functions on smart contracts deployed on the Klever blockchain
   *
   * **Contract Call Types (scType):**
   * - 0: Deploy contract
   * - 1: Invoke contract function
   * - 2: Upgrade contract
   *
   * **Important:**
   * - Use `.data()` to specify function name and arguments
   * - callValue allows sending KLV or KDA tokens with the call
   * - Contract address must be valid bech32 format
   *
   * @param params - Smart contract parameters
   * @param params.address - Contract's bech32 address
   * @param params.scType - Contract call type (0 = deploy, 1 = invoke, 2 = upgrade)
   * @param params.callValue - Optional amounts to send (e.g., { KLV: '1000000' })
   * @returns This builder instance for chaining
   * @throws {ValidationError} If contract address is invalid
   *
   * @example
   * ```typescript
   * // Invoke contract function
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .smartContract({
   *     address: 'klv1contract...',
   *     scType: 1, // Invoke
   *     callValue: { KLV: '1000000' } // Send 1 KLV
   *   })
   *   .data(['transfer', 'klv1receiver...', '500000'])
   *   .build()
   *
   * // Call contract without sending value
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1...')
   *   .smartContract({
   *     address: 'klv1contract...',
   *     scType: 1
   *   })
   *   .data(['getValue'])
   *   .build()
   * ```
   */
  smartContract(params: SmartContractRequest): this {
    if (!isValidAddress(params.address)) {
      throw new ValidationError(`Invalid contract address: ${params.address}`, {
        address: params.address,
      })
    }

    this.contracts.push({
      contractType: 63,
      ...params,
    })

    return this
  }

  /**
   * Recursively convert BigInt values to numbers for JSON serialization
   */
  private convertBigIntToNumber(obj: unknown): unknown {
    if (typeof obj === 'bigint') {
      return Number(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertBigIntToNumber(item))
    }

    if (obj !== null && typeof obj === 'object') {
      const converted: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = this.convertBigIntToNumber(value)
      }
      return converted
    }

    return obj
  }

  /**
   * Build transaction request object for node endpoint
   * Creates a request object that can be sent to the node's /transaction/build endpoint
   * The node will handle nonce fetching, fee calculation, and proto encoding
   *
   * @returns Request object ready to send to node's /transaction/build endpoint
   * @throws {ValidationError} If no contracts have been added
   *
   * @example
   * ```typescript
   * const builder = TransactionBuilder.create()
   *   .sender('klv1...')
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *
   * const request = builder.buildRequest()
   * // Send request to node via HTTP:
   * // POST /transaction/build
   * // Body: request
   * ```
   */
  buildRequest(): BuildTransactionRequest {
    if (this.contracts.length === 0) {
      throw new ValidationError('At least one contract is required')
    }

    const request: BuildTransactionRequest = {
      contracts: this.convertBigIntToNumber(this.contracts) as ContractRequestData[],
    }

    // Only add optional properties if they're defined
    if (this._sender !== undefined) request.sender = this._sender
    if (this._nonce !== undefined) request.nonce = this._nonce
    if (this._kdaFee !== undefined) request.kdaFee = this._kdaFee.kda
    if (this._permissionId !== undefined) request.permissionId = this._permissionId
    // if smart contract transaction, request data must be converted to base64 if not already
    if (this.contracts.some((c) => c.contractType === 63) && this._data !== undefined) {
      const encoder = new TextEncoder()
      request.data = this._data.map((d) => base64Encode(encoder.encode(d)))
    } else if (this._data !== undefined) {
      request.data = this._data
    }

    return request
  }

  /**
   * Build proto transaction offline (client-side, no network required)
   * This method creates a transaction entirely on the client side without contacting the node.
   * You must provide all required parameters (sender, nonce, fees) either via builder state or options.
   *
   * **Offline Mode Benefits:**
   * - No network latency
   * - Works without internet connection
   * - Full control over transaction parameters
   * - Ideal for hardware wallets and air-gapped signing
   *
   * **Fee Calculation:**
   * When building offline, fees must be provided manually or estimated:
   * - KAppFee: Base fee for the contract type (typically 500000-1000000)
   * - BandwidthFee: Fee based on transaction size (typically 100000-500000)
   * - KDAFee: Optional - pay fees in custom KDA instead of KLV
   *
   * @param options - Build options (sender, nonce, fees, etc.)
   * @param options.sender - Sender's bech32 address (required if not set via builder)
   * @param options.nonce - Transaction nonce (required if not set via builder)
   * @param options.chainId - Chain ID (defaults to provider's network if available)
   * @param options.fees - Fee amounts (kAppFee and bandwidthFee)
   * @param options.kdaFee - Optional KDA fee (pay fees in custom asset)
   * @param options.permissionId - Optional permission ID for multi-sig
   * @param options.data - Optional transaction data
   * @returns Transaction object with proto bytes ready to sign
   * @throws {ValidationError} If required parameters are missing or invalid
   *
   * @example
   * ```typescript
   * // Offline build with all parameters in options
   * const tx = TransactionBuilder.create()
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .buildProto({
   *     sender: 'klv1xyz...',
   *     nonce: 123,
   *     chainId: '100',
   *     fees: {
   *       kAppFee: 500000,
   *       bandwidthFee: 100000
   *     }
   *   })
   *
   * await tx.sign(privateKey)
   * const hex = tx.toHex()
   *
   * // Offline build using builder state
   * const tx = TransactionBuilder.create()
   *   .sender('klv1xyz...')
   *   .nonce(123)
   *   .setChainId('100')
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .buildProto({
   *     fees: { kAppFee: 500000, bandwidthFee: 100000 }
   *   })
   *
   * // Offline build with KDA fee (pay fees in custom token)
   * const tx = TransactionBuilder.create()
   *   .sender('klv1xyz...')
   *   .nonce(123)
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .buildProto({
   *     chainId: '100',
   *     fees: { kAppFee: 0, bandwidthFee: 0 },
   *     kdaFee: { kda: 'MYTOKEN-ABCD', amount: '1000000' }
   *   })
   * ```
   */
  buildProto(options: BuildCallOptions = {}): Transaction {
    if (this.contracts.length === 0) {
      throw new ValidationError('At least one contract is required')
    }

    // Convert string to Uint8Array (UTF-8 encoded)
    const encoder = new TextEncoder()

    // check chainId
    const chainId =
      options.chainId ??
      this._chainId ??
      (this.provider ? this.provider.getNetwork().chainId : undefined)
    if (!chainId) {
      throw new Error(
        'Chain ID is required. Set via builder state or provide a provider with network configured.',
      )
    }

    const chainIdBytes = encoder.encode(chainId)

    // Merge options with builder state (options take precedence)
    const sender = options.sender ?? this._sender
    const nonce = options.nonce ?? this._nonce
    const kdaFee = options.kdaFee ?? this._kdaFee
    const permissionId = options.permissionId ?? this._permissionId ?? null
    const data = options.data ?? this._data

    if (options.value) {
      // should be set in smart contract directly for offline proto building
      throw new ValidationError('Value option is not supported for offline proto building', {
        value: options.value,
      })
    }

    // Validate required fields
    if (!sender) {
      throw new ValidationError('Sender address is required. Set via .sender() or options.sender')
    }
    // convert sender from bech32 to bytes
    const senderBytes = bech32Decode(sender)

    if (nonce === undefined) {
      throw new ValidationError('Nonce is required. Set via .nonce() or options.nonce')
    }

    // convert data to Uint8Array[]
    const dataBytes = data ? data.map((d) => encoder.encode(d)) : null

    // TODO: compute kappFess and bandwidthFees if not provided
    const kappFess = options.fees?.kAppFee ?? 0
    const bandwidthFees = options.fees?.bandwidthFee ?? 0

    // encode KDA fee buffer
    const kdaFeeProto: IKDAFee | null =
      kdaFee && kdaFee.kda
        ? {
            KDA: encoder.encode(kdaFee.kda),
            Amount:
              typeof kdaFee.amount === 'bigint'
                ? Number(kdaFee.amount)
                : typeof kdaFee.amount === 'string'
                  ? Number(kdaFee.amount)
                  : kdaFee.amount,
          }
        : null

    // TODO: Implement contract encoding to proto
    return new Transaction({
      RawData: {
        ChainID: chainIdBytes,
        Nonce: nonce,
        Sender: senderBytes.data,
        /** Raw Contract */
        Contract: null,
        /** Raw PermissionID */
        PermissionID: permissionId,

        /** Raw Data */
        Data: dataBytes,

        /** TX Fees */
        KAppFee: kappFess,
        BandwidthFee: bandwidthFees,
        KDAFee: kdaFeeProto,
      },
    })
  }

  /**
   * Build transaction using node endpoint (requires provider)
   * This is the recommended method for most use cases as the node handles complex operations.
   *
   * **Node-Assisted Building:**
   * The node automatically handles:
   * - Nonce fetching (gets current account nonce)
   * - Fee calculation (computes optimal kAppFee and bandwidthFee)
   * - Proto encoding (creates valid proto bytes)
   * - Validation (ensures transaction is valid)
   *
   * **When to Use:**
   * - Standard wallet applications
   * - When you have internet connectivity
   * - When you want automatic fee calculation
   * - When you don't need to control every parameter
   *
   * **Comparison with buildProto():**
   * - build() = Online, automatic, easy (requires provider)
   * - buildProto() = Offline, manual, flexible (no network needed)
   *
   * @returns Transaction object with proto bytes from node, ready to sign
   * @throws {ValidationError} If provider is not set or no contracts added
   * @throws {Error} If node response is invalid or network request fails
   *
   * @example
   * ```typescript
   * // Simple node-assisted build
   * const provider = new KleverProvider({ network: 'mainnet' })
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1xyz...')
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .build()
   *
   * // Node automatically fetches nonce and calculates fees
   * await tx.sign(privateKey)
   * const hash = await provider.sendRawTransaction(tx.toHex())
   *
   * // Build with multiple contracts
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1xyz...')
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .freeze({ amount: '5000000' })
   *   .delegate({ receiver: 'klv1validator...' })
   *   .build()
   *
   * // Override specific parameters
   * const tx = await TransactionBuilder.create(provider)
   *   .sender('klv1xyz...')
   *   .nonce(150) // Override automatic nonce
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .build()
   * ```
   */
  async build(): Promise<Transaction> {
    if (!this.provider) {
      throw new ValidationError(
        'Provider required for node-assisted building. Use buildProto() for offline building.',
      )
    }

    if (this.contracts.length === 0) {
      throw new ValidationError('At least one contract is required')
    }

    // Build request object
    const request = this.buildRequest()

    // Send to node endpoint to build
    const nodeResponse = await this.provider.buildTransaction(request)
    // remove GasLimit
    if (!nodeResponse.result) {
      throw new Error('Node response has no result')
    }
    delete (nodeResponse.result as { [k: string]: unknown })['GasLimit']

    // Return Transaction object from proto result
    // Use fromObject to properly convert base64 strings to Uint8Arrays
    return Transaction.fromObject(nodeResponse.result as { [k: string]: unknown })
  }

  /**
   * Reset builder state to initial values
   * Clears all contracts and builder configuration, allowing reuse of the builder instance
   *
   * **What gets reset:**
   * - All added contracts
   * - Sender address
   * - Nonce
   * - KDA fee
   * - Permission ID
   * - Transaction data
   *
   * **What persists:**
   * - Provider (if set)
   * - Chain ID (if set)
   *
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * const builder = TransactionBuilder.create(provider)
   *
   * // Build first transaction
   * const tx1 = await builder
   *   .sender('klv1...')
   *   .transfer({ receiver: 'klv1abc...', amount: '1000000' })
   *   .build()
   *
   * // Reset and build second transaction
   * const tx2 = await builder
   *   .reset()
   *   .sender('klv1...')
   *   .freeze({ amount: '5000000' })
   *   .build()
   * ```
   */
  reset(): this {
    this.contracts = []
    delete this._sender
    delete this._nonce
    delete this._kdaFee
    delete this._permissionId
    delete this._data
    return this
  }
}
