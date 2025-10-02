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
import { isValidAddress, parseKLV, TXType } from '@klever/connect-core'
import { Transaction } from './transaction'

/**
 * Raw proto build options (offline building)
 */
export interface BuildProtoOptions {
  sender: string
  nonce: number
  fees: {
    kAppFee: number
    bandwidthFee: number
  }
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
  private _sender?: string
  private _nonce?: number
  private _kdaFee?: string
  private _permissionId?: number
  private _data?: string[]

  constructor(private provider?: IProvider) {}

  /**
   * Get the provider instance
   */
  getProvider(): IProvider | undefined {
    return this.provider
  }

  /**
   * Set sender address
   */
  sender(address: string): this {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid sender address: ${address}`)
    }
    this._sender = address
    return this
  }

  /**
   * Set nonce manually
   */
  nonce(nonce: number): this {
    if (nonce < 0) {
      throw new Error('Nonce must be non-negative')
    }
    this._nonce = nonce
    return this
  }

  /**
   * Set KDA fee
   */
  kdaFee(fee: string): this {
    this._kdaFee = fee
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
   * Add transfer contract
   */
  transfer(params: TransferRequest): this {
    if (!isValidAddress(params.receiver)) {
      throw new Error(`Invalid recipient address: ${params.receiver}`)
    }

    const amount =
      typeof params.amount === 'bigint' ? params.amount : parseKLV(params.amount.toString())

    if (amount <= 0n) {
      throw new Error('Transfer amount must be positive')
    }

    this.contracts.push({
      type: TXType.Transfer,
      parameter: {
        receiver: params.receiver,
        amount: amount,
        ...(params.kda && { kda: params.kda }),
        ...(params.kdaRoyalties && { kdaRoyalties: params.kdaRoyalties }),
        ...(params.klvRoyalties && { klvRoyalties: params.klvRoyalties }),
      },
    })

    return this
  }

  /**
   * Add freeze (stake) contract
   */
  freeze(params: FreezeRequest): this {
    const amount =
      typeof params.amount === 'bigint' ? params.amount : parseKLV(params.amount.toString())

    if (amount <= 0n) {
      throw new Error('Freeze amount must be positive')
    }

    this.contracts.push({
      type: TXType.Freeze,
      parameter: {
        amount: amount,
        ...(params.kda && { kda: params.kda }),
      },
    })

    return this
  }

  /**
   * Add unfreeze (unstake) contract
   */
  unfreeze(params: UnfreezeRequest): this {
    if (!params.bucketId) {
      throw new Error('Bucket ID is required for unfreeze')
    }

    this.contracts.push({
      type: TXType.Unfreeze,
      parameter: {
        bucketId: params.bucketId,
        ...(params.kda && { kda: params.kda }),
      },
    })

    return this
  }

  /**
   * Add delegate contract
   */
  delegate(params: DelegateRequest): this {
    if (!isValidAddress(params.receiver)) {
      throw new Error(`Invalid validator address: ${params.receiver}`)
    }

    this.contracts.push({
      type: TXType.Delegate,
      parameter: {
        receiver: params.receiver,
        ...(params.bucketId && { bucketId: params.bucketId }),
      },
    })

    return this
  }

  /**
   * Add undelegate contract
   */
  undelegate(params: UndelegateRequest): this {
    if (!params.bucketId) {
      throw new Error('Bucket ID is required for undelegate')
    }

    this.contracts.push({
      type: TXType.Undelegate,
      parameter: params,
    })

    return this
  }

  /**
   * Add withdraw contract
   */
  withdraw(params: WithdrawRequest): this {
    this.contracts.push({
      type: TXType.Withdraw,
      parameter: params,
    })

    return this
  }

  /**
   * Add claim contract
   */
  claim(params: ClaimRequest): this {
    this.contracts.push({
      type: TXType.Claim,
      parameter: params,
    })

    return this
  }

  /**
   * Add create asset contract
   */
  createAsset(params: CreateAssetRequest): this {
    this.contracts.push({
      type: TXType.CreateAsset,
      parameter: params,
    })

    return this
  }

  /**
   * Add create validator contract
   */
  createValidator(params: CreateValidatorRequest): this {
    this.contracts.push({
      type: TXType.CreateValidator,
      parameter: params,
    })

    return this
  }

  /**
   * Add vote contract
   */
  vote(params: VoteRequest): this {
    this.contracts.push({
      type: TXType.Vote,
      parameter: params,
    })

    return this
  }

  /**
   * Add smart contract (using typed request)
   */
  smartContract(params: SmartContractRequest): this {
    if (!isValidAddress(params.address)) {
      throw new Error(`Invalid contract address: ${params.address}`)
    }

    this.contracts.push({
      type: TXType.SmartContract,
      parameter: params,
    })

    return this
  }

  /**
   * Build transaction request for node endpoint
   * @returns Request object to send to node's /transaction/build endpoint
   */
  buildRequest(): BuildTransactionRequest {
    if (this.contracts.length === 0) {
      throw new Error('At least one contract is required')
    }

    const request: BuildTransactionRequest = {
      contracts: this.contracts,
    }

    // Only add optional properties if they're defined
    if (this._sender !== undefined) request.sender = this._sender
    if (this._nonce !== undefined) request.nonce = this._nonce
    if (this._kdaFee !== undefined) request.kdaFee = this._kdaFee
    if (this._permissionId !== undefined) request.permissionId = this._permissionId
    if (this._data !== undefined) request.data = this._data

    return request
  }

  /**
   * Build proto transaction (client-side, offline)
   * Requires all params (sender, nonce, fees) to be provided
   * @param options - Build options including sender, nonce, and fees
   * @returns Transaction object with proto bytes
   */
  buildProto(_options: BuildProtoOptions): Transaction {
    if (this.contracts.length === 0) {
      throw new Error('At least one contract is required')
    }

    // TODO: Implement proto encoding using @klever/connect-encoding
    // For now, create a placeholder
    // const protoBytes = new Uint8Array(0) // Placeholder

    return new Transaction()
    /*{
      sender: options.sender,
      nonce: options.nonce,
      contracts: this.contracts,
      kAppFee: options.fees.kAppFee,
      bandwidthFee: options.fees.bandwidthFee,
      data: protoBytes,
    }*/
  }

  /**
   * Build transaction using node endpoint (requires provider)
   * Node handles nonce fetching, fee calculation, and proto encoding
   * @returns Transaction object with proto bytes from node
   */
  async build(): Promise<Transaction> {
    if (!this.provider) {
      throw new Error(
        'Provider required for node-assisted building. Use buildProto() for offline building.',
      )
    }

    if (this.contracts.length === 0) {
      throw new Error('At least one contract is required')
    }

    // Build request object
    const request = this.buildRequest()

    // Send to node endpoint to build
    const nodeResponse = await this.provider.buildTransaction(request)
    console.log('Node response:', nodeResponse)

    // Return Transaction object
    return new Transaction(/*nodeResponse*/)
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
