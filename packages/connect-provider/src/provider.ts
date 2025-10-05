import type { KleverAddress, TransactionHash } from '@klever/connect-core'
import { isValidAddress, ValidationError, NetworkError, TransactionError } from '@klever/connect-core'
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
  IBulkBroadcastResult,
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
import { TransactionStatus } from './types/api-types'
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
      throw new ValidationError(`Invalid address: ${address}`, { address })
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
      throw new NetworkError(response.error, { address, endpoint: '/v1.0/address' })
    }

    const apiAccount = response.data.account
    if (!apiAccount) {
      throw new NetworkError('Account not found', { address })
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
      throw new NetworkError(response.error || 'Transaction not found', { hash })
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
   * Broadcasts a single signed transaction to the network
   *
   * @param tx - The signed transaction data
   * @returns Broadcast result with transaction hash
   *
   * @example
   * ```typescript
   * const result = await provider.broadcastTransaction(signedTx)
   * console.log(result.hash) // Transaction hash
   * ```
   */
  async broadcastTransaction(tx: unknown): Promise<IBroadcastResult> {
    const response = await this.nodeClient.post<IBroadcastResponse>('/transaction/broadcast', {
      txs: [tx],
    })

    if (response.error) {
      throw new TransactionError(response.error || 'Broadcast failed', { tx })
    }

    // Extract single hash from response
    const hash =
      (response.data?.txsHashes && response.data.txsHashes.length > 0
        ? response.data.txsHashes[0]
        : response.data?.txHash) ?? ''

    // Validate that we got a hash
    if (!hash) {
      throw new TransactionError(
        response.message || 'Broadcast succeeded but no transaction hash was returned',
        { response }
      )
    }

    return {
      hash,
      ...(response.code !== undefined && { code: response.code }),
      ...(response.message !== undefined && { message: response.message }),
    }
  }

  /**
   * Broadcasts multiple signed transactions to the network in a single batch
   *
   * @param txs - Array of signed transaction data
   * @returns Broadcast result with array of transaction hashes
   *
   * @example
   * ```typescript
   * const result = await provider.broadcastTransactions([tx1, tx2, tx3])
   * console.log(result.hashes) // ['hash1', 'hash2', 'hash3']
   * ```
   */
  async broadcastTransactions(txs: unknown[]): Promise<IBulkBroadcastResult> {
    if (txs.length === 0) {
      throw new ValidationError('At least one transaction is required')
    }

    const response = await this.nodeClient.post<IBroadcastResponse>('/transaction/broadcast', {
      txs,
    })

    if (response.error) {
      throw new TransactionError(response.error || 'Broadcast failed', { txs })
    }

    const hashes = response.data?.txsHashes ?? []
    if (hashes.length === 0 && response.data?.txHash) {
      // Fallback for single transaction response format
      hashes.push(response.data.txHash)
    }

    // Validate that we got hashes
    if (hashes.length === 0) {
      throw new Error(
        response.message || 'Broadcast succeeded but no transaction hashes were returned',
      )
    }

    return {
      hashes,
      ...(response.code !== undefined && { code: response.code }),
      ...(response.message !== undefined && { message: response.message }),
    }
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
      throw new ValidationError(`Invalid address: ${address}`, { address })
    }

    if (!this.network.isTestnet) {
      throw new ValidationError('Faucet is not available on mainnet', { network: this.network.chainId })
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
   * Get the current block number (nonce) from the blockchain
   * @returns Current block nonce
   */
  async getBlockNumber(): Promise<number> {
    try {
      const response = await this.nodeClient.get<{
        data?: {
          overview?: {
            nonce: number
          }
        }
        error?: string
      }>('/node/overview')

      if (response.error || !response.data?.overview?.nonce) {
        throw new NetworkError(response.error || 'Failed to fetch block number')
      }

      return response.data.overview.nonce
    } catch (error) {
      throw new NetworkError(
        `Failed to get block number: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      )
    }
  }

  /**
   * Get block by nonce, hash, or "latest"
   * @param blockHashOrNumber - Block nonce (number), hash (string), or "latest"
   * @returns Block information
   */
  async getBlock(blockHashOrNumber: BlockIdentifier): Promise<IBlockResponse | null> {
    try {
      let endpoint: string

      if (blockHashOrNumber === 'latest') {
        // First get current nonce, then fetch by nonce
        const currentNonce = await this.getBlockNumber()
        endpoint = `/block/by-nonce/${currentNonce}`
      } else if (typeof blockHashOrNumber === 'number') {
        // Fetch by nonce
        endpoint = `/block/by-nonce/${blockHashOrNumber}`
      } else {
        // Fetch by hash
        endpoint = `/block/by-hash/${blockHashOrNumber}`
      }

      const response = await this.apiClient.get<{
        data?: {
          block?: IBlockResponse
        }
        error?: string
        code?: string
      }>(endpoint)

      if (response.error || !response.data?.block) {
        if (this.debug) {
          console.log(`[KleverProvider] Block not found: ${response.error || 'No block data'}`)
        }
        return null
      }

      return response.data.block
    } catch (error) {
      // Handle 404 and 500 errors for non-existent blocks gracefully
      if (
        error instanceof Error &&
        (error.message.includes('HTTP 500') || error.message.includes('HTTP 404'))
      ) {
        if (this.debug) {
          console.log(`[KleverProvider] Block not found: ${error.message}`)
        }
        return null
      }

      if (this.debug) {
        console.error('[KleverProvider] Error fetching block:', error)
      }
      throw new NetworkError(
        `Failed to fetch block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { blockHashOrNumber, originalError: error }
      )
    }
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
   * Parse raw transaction data to a format suitable for broadcasting
   * Supports hex strings, JSON strings, Uint8Arrays, and transaction objects
   * @private
   * @throws {Error} If the transaction data is invalid
   */
  private parseRawTransaction(tx: string | Uint8Array | unknown): unknown {
    if (typeof tx === 'string') {
      // Try to parse as JSON first
      try {
        return JSON.parse(tx)
      } catch {
        // If parsing fails, parse from hex to bytes
        const hex = tx.startsWith('0x') ? tx.slice(2) : tx

        // Validate hex string
        if (!/^[0-9a-fA-F]*$/.test(hex)) {
          throw new ValidationError('Invalid transaction data: not valid JSON or hex string', { tx })
        }

        const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16))
        if (!bytes || bytes.length === 0) {
          throw new ValidationError('Invalid transaction data: empty hex string')
        }

        return new Uint8Array(bytes)
      }
    } else if (tx instanceof Uint8Array) {
      if (tx.length === 0) {
        throw new ValidationError('Invalid transaction data: empty Uint8Array')
      }
      return tx
    } else {
      // Assume it's already a transaction object
      return tx
    }
  }

  /**
   * Sends a single raw transaction to the network
   * @param signedTx - Signed transaction data (hex string, JSON string, Uint8Array, or Transaction object)
   * @returns The transaction hash
   * @throws {Error} If the transaction data is invalid, broadcast fails, or no hash is returned
   *
   * @example
   * ```typescript
   * try {
   *   const hash = await provider.sendRawTransaction(signedTxHex)
   *   console.log(hash) // '0x123...'
   * } catch (error) {
   *   console.error('Broadcast failed:', error.message)
   * }
   * ```
   */
  async sendRawTransaction(signedTx: string | Uint8Array | unknown): Promise<TransactionHash> {
    const txData = this.parseRawTransaction(signedTx)
    const result = await this.broadcastTransaction(txData)

    // Check for error codes even if we got a hash
    // Some APIs may return partial success with warnings
    if (result.code && result.code !== '0' && result.code !== 'successful') {
      throw new TransactionError(result.message || `Transaction broadcast returned error code: ${result.code}`, { code: result.code, message: result.message })
    }

    return result.hash as TransactionHash
  }

  /**
   * Sends multiple raw transactions to the network in a single batch
   * @param signedTxs - Array of signed transaction data (hex strings, JSON strings, Uint8Arrays, or Transaction objects)
   * @returns Array of transaction hashes
   * @throws {Error} If any transaction data is invalid, broadcast fails, or no hashes are returned
   *
   * @example
   * ```typescript
   * try {
   *   const hashes = await provider.sendRawTransactions([tx1Hex, tx2Hex, tx3Hex])
   *   console.log(hashes) // ['0x123...', '0x456...', '0x789...']
   * } catch (error) {
   *   console.error('Broadcast failed:', error.message)
   * }
   * ```
   */
  async sendRawTransactions(
    signedTxs: (string | Uint8Array | unknown)[],
  ): Promise<TransactionHash[]> {
    const txsData = signedTxs.map((tx) => this.parseRawTransaction(tx))
    const result = await this.broadcastTransactions(txsData)

    // Check for error codes even if we got hashes
    // Some APIs may return partial success with warnings
    if (result.code && result.code !== '0' && result.code !== 'successful') {
      throw new TransactionError(result.message || `Transaction broadcast returned error code: ${result.code}`, { code: result.code, message: result.message })
    }

    return result.hashes as TransactionHash[]
  }

  /**
   * Waits for a transaction to be mined and confirmed
   * @param hash - The transaction hash
   * @param confirmations - Number of confirmations to wait for (default: 1)
   * @param onProgress - Optional callback for progress updates
   * @returns The transaction or null if not found/timeout
   *
   * @example
   * ```typescript
   * // Basic usage
   * const tx = await provider.waitForTransaction(hash)
   *
   * // With progress callback for UI updates
   * const tx = await provider.waitForTransaction(hash, 3, (status, data) => {
   *   if (status === 'pending') {
   *     console.log(`Attempt ${data.attempts}/${data.maxAttempts}`)
   *   } else if (status === 'confirming') {
   *     console.log(`Confirmations: ${data.confirmations}/${data.required}`)
   *   }
   * })
   * ```
   */
  waitForTransaction(
    hash: TransactionHash,
    confirmations?: number,
    onProgress?: (
      status: 'pending' | 'confirming' | 'failed' | 'timeout',
      data: {
        attempts: number
        maxAttempts: number
        confirmations?: number
        required?: number
        transaction?: ITransactionResponse
      },
    ) => void,
  ): Promise<ITransactionResponse | null> {
    const confirmationsToWait = confirmations ?? 1
    const pollInterval = 3000 // 3 seconds
    const maxAttempts = 40 // Max 2 minutes

    let attempts = 0

    return new Promise((resolve, reject) => {
      const checkTransaction = async (): Promise<void> => {
        attempts++
        try {
          const tx = await this.getTransaction(hash)

          // Transaction not found yet
          if (!tx) {
            onProgress?.('pending', { attempts, maxAttempts })
            if (attempts >= maxAttempts) {
              clearInterval(interval)
              onProgress?.('timeout', { attempts, maxAttempts })
              resolve(null) // Timeout - transaction not found
            }
            return
          }

          // Transaction is still pending
          if (tx.status === TransactionStatus.Pending) {
            onProgress?.('pending', { attempts, maxAttempts, transaction: tx })
            if (attempts >= maxAttempts) {
              clearInterval(interval)
              onProgress?.('timeout', { attempts, maxAttempts, transaction: tx })
              resolve(null) // Timeout - still pending
            }
            return
          }

          // Transaction failed - return immediately
          if (tx.status === TransactionStatus.Failed) {
            clearInterval(interval)
            onProgress?.('failed', { attempts, maxAttempts, transaction: tx })
            resolve(tx)
            return
          }

          // Transaction succeeded - check confirmations if needed
          if (confirmationsToWait > 1 && tx.blockNum) {
            const currentBlock = await this.getBlockNumber()
            const currentConfirmations = currentBlock - tx.blockNum + 1
            onProgress?.('confirming', {
              attempts,
              maxAttempts,
              confirmations: currentConfirmations,
              required: confirmationsToWait,
              transaction: tx,
            })
            if (currentConfirmations >= confirmationsToWait) {
              clearInterval(interval)
              resolve(tx)
            }
          } else {
            // No confirmation requirement or only 1 confirmation needed
            clearInterval(interval)
            resolve(tx)
          }
        } catch (error) {
          clearInterval(interval)
          reject(
            new Error(
              `Error while waiting for transaction: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            ),
          )
        }
      }

      const interval = setInterval(() => {
        void checkTransaction()
      }, pollInterval)
    })
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
   * - Returns proto transaction object and transaction hash
   *
   * @param request - Transaction build request with contracts and optional sender/nonce
   * @returns Proto transaction object and transaction hash
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
   * // tx.result contains proto transaction object (ITransaction)
   * // tx.txHash contains the transaction hash
   * ```
   */
  async buildTransaction(request: BuildTransactionRequest): Promise<BuildTransactionResponse> {
    if (!request.contracts || request.contracts.length === 0) {
      throw new ValidationError('At least one contract is required')
    }

    try {
      // Auto-fetch nonce if not provided
      if (request.sender && request.nonce === undefined) {
        const nonceResponse = await this.nodeClient.get<
          ApiResponse<{
            nonce: number
            firstPendingNonce: number
            txPending: number
          }>
        >(`/address/${request.sender}/nonce`)

        request.nonce = nonceResponse.data?.nonce || 0
      }

      // Call node endpoint to build transaction
      const response = await this.nodeClient.post<
        ApiResponse<{
          result: unknown // Proto transaction object (ITransaction)
          txHash: string
        }>
      >('/transaction/send', request)

      if (response.error || !response.data) {
        throw new NetworkError(response.error || 'Failed to build transaction', { request })
      }

      return {
        result: response.data.result,
        txHash: response.data.txHash,
      }
    } catch (error) {
      throw new TransactionError(
        `Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { request, originalError: error }
      )
    }
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Execute multiple requests in parallel
   * Useful for batching multiple API calls for better performance
   *
   * @param requests - Array of request functions to execute
   * @returns Array of results in the same order as requests
   *
   * @example
   * ```typescript
   * const [account1, account2, balance] = await provider.batch([
   *   () => provider.getAccount('klv1...'),
   *   () => provider.getAccount('klv1xxx...'),
   *   () => provider.getBalance('klv1...')
   * ])
   * ```
   */
  async batch<T>(requests: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(requests.map(req => req()))
  }

  // ============================================================================
  // Web3 Naming Convention Aliases
  // ============================================================================

  /**
   * Alias for getAccount() - matches Solana web3.js naming convention
   * @see getAccount
   */
  async getAccountInfo(address: KleverAddress, options?: { skipCache?: boolean }): Promise<IAccount> {
    return this.getAccount(address, options)
  }

  /**
   * Alias for broadcastTransaction() - matches ethers.js and web3.js naming convention
   * More commonly used in Web3 ecosystems
   * @see broadcastTransaction
   */
  async sendTransaction(tx: unknown): Promise<IBroadcastResult> {
    return this.broadcastTransaction(tx)
  }
}
