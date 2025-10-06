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

import { bech32Decode } from '@klever/connect-encoding'
import type { AmountLike } from '@klever/connect-provider'
import type { IKDAFee } from '@klever/connect-encoding'

/**
 * Raw proto build options (offline building)
 * All fields are optional - will use builder's state if not provided
 */
export interface BuildProtoOptions {
  chainId?: string
  sender?: string
  nonce?: number
  fees?: {
    kAppFee: number
    bandwidthFee: number
  }
  kdaFee?: { kda: string; amount: AmountLike }
  permissionId?: number
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
   */
  setChainId(chainId: string): this {
    this._chainId = chainId
    return this
  }

  /**
   * Set sender address
   */
  sender(address: string): this {
    if (!isValidAddress(address)) {
      throw new ValidationError(`Invalid sender address: ${address}`, { address })
    }
    this._sender = address
    return this
  }

  /**
   * Set nonce manually
   */
  nonce(nonce: number): this {
    if (nonce < 0) {
      throw new ValidationError('Nonce must be non-negative', { nonce })
    }
    this._nonce = nonce
    return this
  }

  /**
   * Set KDA fee
   */
  kdaFee(fee: { kda: string; amount: AmountLike }): this {
    if (!fee.kda) {
      throw new ValidationError('KDA fee asset ID is required')
    }
    // can`t use KLV as kdaFee (its default if not set)
    if (fee.kda === 'KLV') {
      throw new ValidationError('KDA fee cannot be KLV - use KAppFee and BandwidthFee instead', { assetId: fee.kda })
    }

    const amount = typeof fee.amount === 'bigint' ? fee.amount : BigInt(fee.amount)
    if (amount < 0n) {
      throw new ValidationError('KDA fee amount must be non-negative', { amount })
    }
    this._kdaFee = { kda: fee.kda, amount }
    return this
  }

  /**
   * Set permission ID
   */
  permissionId(id: number): this {
    this._permissionId = id
    return this
  }

  /**
   * Set transaction data
   */
  data(data: string[]): this {
    this._data = data
    return this
  }

  /**
   * Add a contract using ContractRequestData
   * Routes to the appropriate builder method based on contractType
   *
   * @example
   * ```typescript
   * builder.addContract({
   *   contractType: 0,
   *   receiver: 'klv1...',
   *   amount: 1000000
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
   * Add transfer contract
   */
  transfer(params: TransferRequest): this {
    if (!isValidAddress(params.receiver)) {
      throw new ValidationError(`Invalid recipient address: ${params.receiver}`, { address: params.receiver })
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
   * Add freeze (stake) contract
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
   * Add unfreeze (unstake) contract
   * - kda: Required - the asset to unfreeze
   * - bucketId: Optional - only required for KLV
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
   * Add delegate contract
   */
  delegate(params: DelegateRequest): this {
    if (!isValidAddress(params.receiver)) {
      throw new ValidationError(`Invalid validator address: ${params.receiver}`, { address: params.receiver })
    }

    this.contracts.push({
      contractType: 6,
      receiver: params.receiver,
      ...(params.bucketId && { bucketId: params.bucketId }),
    })

    return this
  }

  /**
   * Add undelegate contract
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
   * Add withdraw contract
   */
  withdraw(params: WithdrawRequest): this {
    this.contracts.push({
      contractType: 8,
      ...params,
    })

    return this
  }

  /**
   * Add claim contract
   */
  claim(params: ClaimRequest): this {
    this.contracts.push({
      contractType: 9,
      ...params,
    })

    return this
  }

  /**
   * Add create asset contract
   */
  createAsset(params: CreateAssetRequest): this {
    this.contracts.push({
      contractType: 1,
      ...params,
    })

    return this
  }

  /**
   * Add create validator contract
   */
  createValidator(params: CreateValidatorRequest): this {
    this.contracts.push({
      contractType: 2,
      ...params,
    })

    return this
  }

  /**
   * Add vote contract
   */
  vote(params: VoteRequest): this {
    this.contracts.push({
      contractType: 14,
      ...params,
    })

    return this
  }

  /**
   * Add smart contract (using typed request)
   */
  smartContract(params: SmartContractRequest): this {
    if (!isValidAddress(params.address)) {
      throw new ValidationError(`Invalid contract address: ${params.address}`, { address: params.address })
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
   * Build transaction request for node endpoint
   * @returns Request object to send to node's /transaction/build endpoint
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
    if (this._data !== undefined) request.data = this._data

    return request
  }

  /**
   * Build proto transaction (client-side, offline)
   * Options override builder state if provided, otherwise uses builder's state
   *
   * @param options - Optional build options (sender, nonce, fees, etc.)
   * @returns Transaction object with proto bytes
   *
   * @example
   * ```typescript
   * // Using builder state
   * const tx = new TransactionBuilder()
   *   .sender('klv1...')
   *   .nonce(123)
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .buildProto({ fees: { kAppFee: 500000, bandwidthFee: 100000 } })
   *
   * // Using options to override
   * const tx2 = new TransactionBuilder()
   *   .transfer({ receiver: 'klv1...', amount: '1000000' })
   *   .buildProto({
   *     sender: 'klv1...',
   *     nonce: 123,
   *     fees: { kAppFee: 500000, bandwidthFee: 100000 }
   *   })
   * ```
   */
  buildProto(options: BuildProtoOptions = {}): Transaction {
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
            Amount: typeof kdaFee.amount === 'bigint' ? kdaFee.amount : BigInt(kdaFee.amount),
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
   * Node handles nonce fetching, fee calculation, and proto encoding
   * @returns Transaction object with proto bytes from node
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

    // Return Transaction object from proto result
    // Use fromObject to properly convert base64 strings to Uint8Arrays
    return Transaction.fromObject(nodeResponse.result as { [k: string]: unknown })
  }

  /**
   * Reset builder state
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
