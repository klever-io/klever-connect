import type { KleverAddress, TransactionHash } from '@klever/connect-core'
import { isValidAddress } from '@klever/connect-core'
import type { ProviderConfig } from './types/provider'
import type { Network, NetworkName } from './types/network'
import type {
  IAccount,
  IAssetBalance,
  ApiResponse,
  AddressResponse,
  ITransactionResponse,
  IBlockResponse,
  IBroadcastResult,
  IContractQueryParams,
  IContractQueryResult,
  IFaucetResult,
  IReceipt,
  ITransactionApiResponse,
  IBroadcastResponse,
  IContractQueryResponse,
  IFaucetResponse,
  IFeesResponse,
} from './types/api-types'
import { NETWORKS, DEFAULT_NETWORK } from './networks'
import { HttpClient } from './http-client'
import { SimpleCache } from './cache'
import type {
  BlockIdentifier,
  IProvider,
  ProviderEvent,
  BuildTransactionRequest,
  BuildTransactionResponse,
} from './types/types'

/**
 * Klever blockchain provider with built-in caching and retry capabilities
 *
 * @example
 * ```typescript
 * // Basic usage
 * const provider = new KleverProvider({
 *   network: NETWORKS.testnet
 * })
 *
 * // Advanced usage with caching and retry
 * const provider = new KleverProvider({
 *   network: NETWORKS.mainnet,
 *   cache: {
 *     ttl: 15000, // 15 seconds
 *     maxSize: 100
 *   },
 *   retry: {
 *     maxRetries: 3,
 *     retryDelay: 1000,
 *     backoff: 'exponential'
 *   },
 *   debug: true
 * })
 *
 * const account = await provider.getAccount('klv1...')
 * ```
 */
export class KleverProvider implements IProvider {
  readonly network: Network
  protected apiClient: HttpClient
  protected nodeClient: HttpClient
  protected cache?: SimpleCache<unknown>
  protected readonly debug: boolean

  /**
   * Creates a new KleverProvider instance
   *
   * @param config - Provider configuration options
   */
  constructor(config?: ProviderConfig) {
    // Resolve network configuration
    const networkConfig = config?.network ?? NETWORKS[DEFAULT_NETWORK]
    this.network = networkConfig

    this.debug = config?.debug ?? false

    // Set up HTTP clients
    const httpClientConfig = {
      baseUrl: this.network.config.api ?? 'http://localhost:8080',
      ...(config?.timeout !== undefined && { timeout: config.timeout }),
      ...(config?.headers !== undefined && { headers: config.headers }),
      retries: config?.retry === false ? 0 : (config?.retry?.maxRetries ?? 3),
    }
    this.apiClient = new HttpClient(httpClientConfig)

    const nodeClientConfig = {
      baseUrl: this.network.config.node ?? this.network.config.api ?? 'http://localhost:8080',
      ...(config?.timeout !== undefined && { timeout: config.timeout }),
      ...(config?.headers !== undefined && { headers: config.headers }),
      retries: config?.retry === false ? 0 : (config?.retry?.maxRetries ?? 3),
    }
    this.nodeClient = new HttpClient(nodeClientConfig)

    // Set up cache if enabled
    if (config?.cache !== false) {
      this.cache = new SimpleCache(config?.cache ?? {})
    }

    if (this.debug) {
      console.log(`[KleverProvider] Initialized with network: ${this.network.name}`)
    }
  }

  /**
   * Retrieves account information from the blockchain
   *
   * @param address - The Klever address to query
   * @param options - Additional options
   * @returns Account information including balance and assets
   * @throws {Error} If the address is invalid
   *
   * @example
   * ```typescript
   * const account = await provider.getAccount('klv1...')
   * console.log('Balance:', account.balance)
   * console.log('Assets:', account.assets)
   * ```
   */
  async getAccount(address: KleverAddress, options?: { skipCache?: boolean }): Promise<IAccount> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`)
    }

    const cacheKey = `account:${address}`

    // Check cache first
    if (!options?.skipCache && this.cache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached as IAccount
      }
    }

    const response = await this.apiClient.get<ApiResponse<AddressResponse>>(
      `/v1.0/address/${address}`,
    )

    if (response.error) {
      throw new Error(response.error)
    }

    const apiAccount = response.data.account
    if (!apiAccount) {
      throw new Error('Account not found')
    }

    // Convert API response to IAccount format
    const assets: IAssetBalance[] = Object.entries(apiAccount.assets || {}).map(
      ([assetId, assetData]) => ({
        assetId,
        balance: BigInt(assetData.balance),
      }),
    )

    const account: IAccount = {
      address: apiAccount.address,
      balance: BigInt(apiAccount.balance),
      nonce: apiAccount.nonce,
      assets,
    }

    // Cache the result
    if (this.cache) {
      this.cache.set(cacheKey, account)
    }

    return account
  }

  /**
   * Get balance for a specific token
   *
   * @param address - Klever address
   * @param token - Token identifier (e.g., 'KLV', 'KDA-ABC123')
   * @returns Balance as bigint
   *
   * @example
   * ```typescript
   * const balance = await provider.getBalance('klv1...', 'KLV')
   * console.log(`Balance: ${balance}`)
   * ```
   */
  async getBalance(address: KleverAddress, token = 'KLV'): Promise<bigint> {
    const account = await this.getAccount(address)

    if (token === 'KLV') {
      return account.balance
    }

    const asset = account.assets?.find((a) => a.assetId === token)
    return asset?.balance ?? 0n
  }

  /**
   * Retrieves transaction information by hash
   *
   * @param hash - The transaction hash
   * @returns Transaction details
   */
  async getTransaction(hash: string): Promise<ITransactionResponse | null> {
    const cacheKey = `tx:${hash}`

    if (this.cache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached as ITransactionResponse
      }
    }

    const response = await this.apiClient.get<ApiResponse<ITransactionApiResponse>>(
      `/v1.0/transaction/${hash}?withResults=true`,
    )

    if (response.error || !response.data?.transaction) {
      throw new Error(response.error || 'Transaction not found')
    }

    const transaction = response.data.transaction

    if (this.cache) {
      this.cache.set(cacheKey, transaction)
    }

    return transaction
  }

  async getTransactionReceipt(hash: TransactionHash): Promise<IReceipt[] | null> {
    const tx = await this.getTransaction(hash)
    if (!tx) {
      return null
    }

    return tx.receipts ?? []
  }

  /**
   * Broadcasts a signed transaction to the network
   *
   * @param tx - The signed transaction data (raw encoded transaction)
   * @returns Broadcast result with transaction hash
   *
   * @example
   * ```typescript
   * // Send raw hex string
   * const result = await provider.broadcastTransaction({ tx: '0x...' })
   *
   * // Or use sendRawTransaction for convenience
   * const hash = await provider.sendRawTransaction(encodedTxBytes)
   * ```
   */
  async broadcastTransaction(tx: unknown): Promise<IBroadcastResult> {
    const response = await this.nodeClient.post<IBroadcastResponse>('/transaction/broadcast', tx)

    if (response.error) {
      throw new Error(response.error || 'Broadcast failed')
    }

    const result: IBroadcastResult = {
      hash: response.data?.txHash ?? response.data?.hash ?? '',
    }
    if (response.code !== undefined) result.code = response.code
    if (response.message !== undefined) result.message = response.message
    return result
  }

  /**
   * Queries a smart contract
   *
   * @param params - Contract query parameters
   * @returns Query result
   */
  async queryContract(params: IContractQueryParams): Promise<IContractQueryResult> {
    const response = await this.apiClient.post<IContractQueryResponse>('/sc/query', params)

    if (response.error) {
      const errorResult: IContractQueryResult = {
        error: response.error,
      }
      if (response.code !== undefined) errorResult.code = response.code
      return errorResult
    }

    const result: IContractQueryResult = {
      data: {
        ...(response.data?.returnData !== undefined && { returnData: response.data.returnData }),
        ...(response.data?.returnCode !== undefined && { returnCode: response.data.returnCode }),
        ...(response.data?.returnMessage !== undefined && {
          returnMessage: response.data.returnMessage,
        }),
        ...(response.data?.gasRemaining !== undefined && {
          gasRemaining: BigInt(response.data.gasRemaining),
        }),
        ...(response.data?.gasRefund !== undefined && {
          gasRefund: BigInt(response.data.gasRefund),
        }),
      },
    }
    return result
  }

  /**
   * Requests test KLV from faucet (testnet/devnet only)
   *
   * @param address - The address to send test KLV to
   * @param amount - Optional amount to request
   * @returns Faucet result with transaction hash
   */
  async requestTestKLV(address: KleverAddress, amount?: bigint): Promise<IFaucetResult> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`)
    }

    if (!this.network.isTestnet) {
      throw new Error('Faucet is not available on mainnet')
    }

    const response = await this.apiClient.post<IFaucetResponse>(
      `/v1.0/transaction/send-user-funds/${address}`,
      amount ? { amount: amount.toString() } : undefined,
    )

    return {
      txHash: response.data?.txHash ?? '',
      status: response.data?.status ?? 'pending',
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache?.clear()
    if (this.debug) {
      console.log('[KleverProvider] Cache cleared')
    }
  }

  /**
   * Get the full URL for viewing a transaction in the explorer
   * @param txHash - The transaction hash
   * @returns The full URL to view the transaction
   *
   * @example
   * ```typescript
   * const txUrl = provider.getTransactionUrl('0x123...')
   * console.log(txUrl) // https://kleverscan.org/transaction/0x123...
   * ```
   */
  getTransactionUrl(txHash: string): string {
    return `${this.network.config.explorer}/transaction/${txHash}`
  }

  /**
   * Get the network name
   */
  getNetworkName(): NetworkName {
    return this.network.name
  }

  /**
   * Get the network object
   */
  getNetwork(): Network {
    return this.network
  }

  /**
   * Get the block number
   */
  getBlockNumber(): Promise<number> {
    // TODO:
    return Promise.resolve(0)
  }

  /**
   * Get the block by hash or number
   */
  getBlock(_blockHashOrNumber: BlockIdentifier): Promise<IBlockResponse | null> {
    // TODO:
    return Promise.resolve(null)
  }

  /**
   * Estimates the fee for a transaction
   * @param tx - The transaction request
   * @returns The estimated fee
   */
  estimateFee(_tx: unknown): Promise<IFeesResponse> {
    // TODO:
    return Promise.resolve({
      kAppFee: 0,
      bandwidthFee: 0,
      gasEstimated: 0,
      safetyMargin: 0,
      gasMultiplier: 0,
      returnMessage: '',
      kdaFee: {
        kda: new Uint8Array(),
        amount: 0,
      },
    })
  }

  /**
   * Sends a raw transaction to the network
   * @param signedTx - The signed transaction data (hex string or bytes)
   * @returns The transaction hash
   */
  async sendRawTransaction(signedTx: string | Uint8Array): Promise<TransactionHash> {
    // Convert Uint8Array to hex string if needed
    const txData = typeof signedTx === 'string' ? signedTx : Buffer.from(signedTx).toString('hex')

    const result = await this.broadcastTransaction({ tx: txData })
    return result.hash as TransactionHash
  }

  /**
   * Waits for a transaction to be mined and confirmed
   * @param hash - The transaction hash
   * @param confirmations - Number of confirmations to wait for
   * @returns The transaction or null if not found
   */
  waitForTransaction(
    _hash: TransactionHash,
    _confirmations?: number,
  ): Promise<ITransactionResponse | null> {
    // TODO:
    return Promise.resolve(null)
  }

  on(_event: ProviderEvent, _listener: (...args: unknown[]) => void): void {
    // TODO:
  }

  off(_event: ProviderEvent, _listener: (...args: unknown[]) => void): void {
    // TODO:
  }

  /**
   * Calls a contract method
   *
   * @param endpoint - The API endpoint for the contract call
   * @param params - The parameters for the contract call
   * @returns The result of the contract call
   */
  async call<T = unknown>(_endpoint: string, _params?: Record<string, unknown>): Promise<T> {
    // TODO: Implement contract call logic
    return {} as T
  }

  /**
   * Build transaction using node endpoint
   * Node will handle nonce fetching (if missing), fee calculation, and proto encoding
   *
   * This method provides server-side transaction building where the node does the heavy lifting:
   * - Fetches nonce if not provided
   * - Calculates kAppFee and bandwidthFee
   * - Encodes transaction to proto format
   * - Returns ready-to-sign transaction data
   *
   * @param request - Transaction build request with contracts and optional sender/nonce
   * @returns Built transaction with proto bytes ready for signing
   *
   * @example
   * ```typescript
   * const request = {
   *   sender: 'klv1...',
   *   contracts: [{
   *     type: TXType.Transfer,
   *     parameter: { receiver: 'klv1...', amount: 1000000n, kda: 'KLV' }
   *   }]
   * }
   * const tx = await provider.buildTransaction(request)
   * // tx.data contains proto bytes ready for signing
   * ```
   */
  async buildTransaction(request: BuildTransactionRequest): Promise<BuildTransactionResponse> {
    if (!request.contracts || request.contracts.length === 0) {
      throw new Error('At least one contract is required')
    }

    try {
      // Call node endpoint to build transaction
      const response = await this.nodeClient.post<{
        data?: {
          sender: string
          nonce: number
          kAppFee: number
          bandwidthFee: number
          data: string // hex-encoded proto bytes
        }
        error?: string
      }>('/transaction/build', request)

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to build transaction')
      }

      return {
        sender: response.data.sender,
        nonce: response.data.nonce,
        contracts: request.contracts,
        kAppFee: response.data.kAppFee,
        bandwidthFee: response.data.bandwidthFee,
        data: Buffer.from(response.data.data, 'hex'),
      }
    } catch (error) {
      throw new Error(
        `Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
