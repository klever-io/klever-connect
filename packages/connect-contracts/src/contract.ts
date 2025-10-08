/**
 * Contract Class for Klever Smart Contracts
 *
 * Provides ethers.js-like API for contract interactions with
 * auto-generated methods from ABI.
 *
 * The Contract class is the primary way to interact with deployed smart contracts
 * on the Klever blockchain. It automatically generates typed methods based on the
 * contract's ABI, making it easy to call functions and query state.
 *
 * @remarks
 * Contract methods are dynamically generated based on the ABI:
 * - Readonly functions become query methods (read-only, no transaction)
 * - Mutable functions become transaction methods (state-changing, requires signing)
 *
 * @example Basic contract interaction
 * ```typescript
 * import { Contract } from '@klever/connect-contracts'
 * import { Wallet } from '@klever/connect-wallet'
 *
 * const abi = [...] // Contract ABI
 * const wallet = new Wallet(privateKey, provider)
 * const contract = new Contract('klv1...', abi, wallet)
 *
 * // Query (readonly) - no transaction needed
 * const balance = await contract.balanceOf(address)
 *
 * // Transaction (mutable) - requires signing
 * const tx = await contract.transfer(toAddress, amount)
 * await tx.wait() // Wait for confirmation
 * ```
 *
 * @example Using invoke() for explicit state changes
 * ```typescript
 * // Invoke a mutable function explicitly
 * const result = await contract.invoke('bet', betType, betValue, {
 *   value: parseKLV('10'), // Send 10 KLV with call
 *   nonce: 123
 * })
 * await result.wait()
 * ```
 *
 * @example Parsing events from transactions
 * ```typescript
 * const tx = await contract.transfer(toAddress, amount)
 * const receipt = await tx.wait()
 *
 * // Parse all events from this contract
 * const events = contract.parseEvents(receipt.logs)
 *
 * // Filter events by identifier
 * const transferEvents = contract.parseEvents(receipt.logs, {
 *   identifier: 'Transfer'
 * })
 * ```
 */

import type { ContractABI } from './types/abi'
import type { CallOptions } from './types/contract'
import { Interface } from './interface'
import { ABIEncoder } from './encoder/abi-encoder'
import { ABIDecoder } from './decoder/abi-decoder'
import { TransactionBuilder } from '@klever/connect-transactions'
import type { Transaction } from '@klever/connect-transactions'
import type { KleverAddress, Network } from '@klever/connect-core'
import type { TransactionHash } from '@klever/connect-core'
import type { TransactionSubmitResult, ITransactionResponse } from '@klever/connect-provider'
import {
  EventParser,
  type ContractEvent,
  type ContractEventFilter,
  type TransactionLog,
} from './event-parser'

/**
 * Signer interface (compatible with @klever/connect-wallet)
 */
export interface Signer {
  address: string
  signTransaction: (tx: Transaction) => Promise<Transaction>
  provider?: Provider
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

export interface IAccount {
  address: string
  balance: bigint
  nonce: number
  assets?: IAssetBalance[]
}

export interface IAssetBalance {
  /** Asset ID (KDA ID) */
  assetId: string
  /** Collection ID for NFTs */
  collection?: string | undefined
  /** NFT nonce for specific NFT instances */
  nftNonce?: number | undefined
  /** Human-readable asset name */
  assetName: string
  /** Total balance in smallest units */
  balance: bigint
  /** Number of decimal places for display */
  precision: number
  /** Frozen balance (staked) in smallest units */
  frozenBalance: bigint
  /** Unfrozen balance (available after unstaking cooldown) */
  unfrozenBalance: bigint
}

/**
 * Provider interface (compatible with @klever/connect-provider)
 * Simplified interface for contract interactions
 */
export interface Provider {
  queryContract: (params: IContractQueryParams) => Promise<IContractQueryResult>
  // Optional: full provider interface for TransactionBuilder
  getNetwork?: () => Network
  getAccount?: (address: KleverAddress) => Promise<IAccount>
  sendRawTransaction(signedTx: string | Uint8Array | unknown): Promise<TransactionHash>
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
  ): Promise<ITransactionResponse | null>
}

/**
 * Contract class with dynamic methods
 *
 * @remarks
 * The Contract class provides two types of interactions:
 *
 * 1. Query (Readonly): Functions marked as 'readonly' in the ABI
 *    - No transaction created
 *    - No gas fees
 *    - Returns data immediately
 *    - Accessed via dynamically generated methods or `call()`
 *
 * 2. Invoke (Mutable): Functions that modify contract state
 *    - Creates and signs a transaction
 *    - Requires gas fees
 *    - Returns transaction result with `wait()` method
 *    - Accessed via dynamically generated methods or `invoke()`
 *
 * @see {@link Interface} for ABI parsing and encoding
 * @see {@link ABIEncoder} for parameter encoding
 * @see {@link ABIDecoder} for result decoding
 */
export class Contract {
  readonly address: string
  readonly interface: Interface
  readonly provider?: Provider
  readonly signer?: Signer
  readonly populateTransaction: { [key: string]: (...args: unknown[]) => Promise<Transaction> }
  private encoder: ABIEncoder
  private decoder: ABIDecoder;

  // Dynamic methods will be added here
  [key: string]: unknown

  constructor(address: string, abi: string | ContractABI, signerOrProvider?: Signer | Provider) {
    this.address = address
    this.interface = new Interface(abi)
    this.encoder = new ABIEncoder(this.interface.abi)
    this.decoder = new ABIDecoder(this.interface.abi)
    this.populateTransaction = {}

    // Determine if we have a signer or provider
    if (signerOrProvider) {
      if ('signTransaction' in signerOrProvider) {
        this.signer = signerOrProvider
        if (signerOrProvider.provider) {
          this.provider = signerOrProvider.provider
        }
      } else {
        this.provider = signerOrProvider
      }
    }

    // Generate methods for each endpoint
    this._generateMethods()
  }

  /**
   * Generate dynamic methods for contract endpoints
   */
  private _generateMethods(): void {
    const endpoints = this.interface.getEndpointNames()

    for (const name of endpoints) {
      if (!name) continue

      const isReadonly = this.interface.isReadonly(name)

      if (isReadonly) {
        // Create query method
        this[name] = this._createQueryMethod(name)
      } else {
        // Create transaction method (with broadcast)
        this[name] = this._createTransactionMethod(name)

        // Create populateTransaction method (build-only, no broadcast)
        this.populateTransaction[name] = this._createPopulateMethod(name)
      }
    }
  }

  /**
   * Create a query method (readonly)
   */
  private _createQueryMethod(functionName: string) {
    return async (...args: unknown[]): Promise<unknown> => {
      if (!this.provider) {
        throw new Error('Provider is required for query calls')
      }

      // Encode arguments using ABI-aware encoder
      const encodedArgs = this._encodeArguments(args, functionName)

      // Convert encoded arguments to base64 strings for API
      const base64Args = encodedArgs.map((arg) => Buffer.from(arg).toString('base64'))

      // Call queryContract from provider with proper params
      const result = await this.provider.queryContract({
        ScAddress: this.address,
        FuncName: functionName,
        Arguments: base64Args,
      })

      // Check for errors
      if (result.error) {
        throw new Error(`Contract query failed: ${result.error}`)
      }

      // Decode result using ABI-aware decoder
      if (result.data?.returnData) {
        const decoded = this.decoder.decodeFunctionResults(functionName, result.data.returnData)
        // Return single value if only one output, otherwise return array
        return decoded.length === 1 ? decoded[0] : decoded
      }

      return result.data
    }
  }

  /**
   * Build transaction for contract function call (shared logic)
   */
  private async _buildContractTransaction(
    functionName: string,
    args: unknown[],
  ): Promise<Transaction> {
    if (!this.signer) {
      throw new Error('Signer is required for transactions')
    }

    // Extract options if last argument is CallOptions
    let options: CallOptions = {}
    let functionArgs = args

    if (args.length > 0 && this._isCallOptions(args[args.length - 1])) {
      options = args[args.length - 1] as CallOptions
      functionArgs = args.slice(0, -1)
    }

    // Encode arguments using ABI-aware encoder
    const encodedArgs = this._encodeArguments(functionArgs, functionName)

    // Encode function call
    const callData = this.interface.encodeFunctionCall(functionName, encodedArgs)

    // Build transaction using TransactionBuilder
    const builder = this.provider
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new TransactionBuilder(this.provider as any)
      : new TransactionBuilder()

    builder.sender(this.signer.address)

    // add others options
    builder.callOptions(options)

    builder.smartContract({
      scType: 0, // Call existing contract
      address: this.address,
      ...(options.value && { callValue: options.value }),
    })

    // Add call data
    builder.data([callData])

    // Build transaction (uses node if provider available, otherwise offline)
    if (this.provider) {
      // Node-assisted build (fetches nonce, fees, etc.)
      return await builder.build()
    } else {
      // Offline build (requires manual nonce/fees via options)
      if (!options.nonce) {
        throw new Error('Nonce is required for offline transaction building')
      }
      return builder.buildProto({
        nonce: options.nonce,
        ...(options.fees && { fees: options.fees }),
        ...(options.chainId && { chainId: options.chainId }),
      })
    }
  }

  /**
   * Create a transaction method (mutable) - builds, signs, and broadcasts
   */
  private _createTransactionMethod(functionName: string) {
    return async (...args: unknown[]): Promise<TransactionSubmitResult> => {
      // Build the transaction
      const tx = await this._buildContractTransaction(functionName, args)

      // Sign transaction using signer
      const signedTx = await this.signer?.signTransaction(tx)
      if (!signedTx) {
        throw new Error('Failed to sign transaction')
      }

      // broadcast if provider available
      if (this.provider) {
        const hash = await this.provider.sendRawTransaction(signedTx)

        // Return TransactionSubmitResult with wait() method
        return {
          hash,
          status: 'success' as const,
          transaction: signedTx,
          wait: async () => {
            const result = await this.provider?.waitForTransaction(hash)
            if (!result) {
              throw new Error(`Transaction ${String(hash)} not found or timed out`)
            }
            return result
          },
        }
      }

      // No provider - return without broadcasting
      return {
        hash: signedTx.getHash() as TransactionHash,
        status: 'pending' as const,
        transaction: signedTx,
      }
    }
  }

  /**
   * Create a populate method (build transaction without signing/broadcasting)
   */
  private _createPopulateMethod(functionName: string) {
    return async (...args: unknown[]): Promise<Transaction> => {
      // Just build and return the unsigned transaction
      return this._buildContractTransaction(functionName, args)
    }
  }

  /**
   * Check if argument is CallOptions
   * CallOptions has specific keys: value, gasLimit, nonce, fees, chainId
   */
  private _isCallOptions(arg: unknown): boolean {
    if (!arg || typeof arg !== 'object') return false
    const obj = arg as Record<string, unknown>

    // Valid CallOptions keys
    const validKeys = [
      'value',
      'nonce',
      'sender',
      'kdaFee',
      'fees',
      'chainId',
      'permissionId',
      'data',
    ]
    const objKeys = Object.keys(obj)

    // Check if at least one key is a valid CallOptions key
    return objKeys.some((key) => validKeys.includes(key))
  }

  /**
   * Encode arguments based on ABI
   */
  private _encodeArguments(args: unknown[], functionName?: string): Uint8Array[] {
    if (!functionName) {
      // If no function name, assume args are already encoded
      const allAreUint8Array = args.every((arg) => arg instanceof Uint8Array)
      if (allAreUint8Array) {
        // All arguments are already Uint8Array
        return args.filter((arg): arg is Uint8Array => arg instanceof Uint8Array)
      }
      return args.map(() => new Uint8Array())
    }

    // Use ABI-aware encoding
    return this.encoder.encodeFunctionArgs(functionName, args)
  }

  /**
   * Check if contract has a function
   *
   * Verifies whether the contract's ABI includes a function with the specified name.
   *
   * @param functionName - The name of the function to check
   * @returns True if the function exists in the contract's ABI, false otherwise
   *
   * @example
   * ```typescript
   * if (contract.hasFunction('transfer')) {
   *   await contract.transfer(toAddress, amount)
   * }
   * ```
   */
  hasFunction(functionName: string): boolean {
    return this.interface.getEndpointNames().includes(functionName)
  }

  /**
   * Get all available function names
   *
   * Returns an array of all function names defined in the contract's ABI,
   * including both readonly (query) and mutable (transaction) functions.
   *
   * @returns Array of function names
   *
   * @example
   * ```typescript
   * const functions = contract.getFunctions()
   * console.log(functions) // ['transfer', 'balanceOf', 'approve', ...]
   *
   * // Iterate over all functions
   * for (const funcName of contract.getFunctions()) {
   *   console.log(`Function: ${funcName}`)
   * }
   * ```
   */
  getFunctions(): string[] {
    return this.interface.getEndpointNames()
  }

  /**
   * Call a contract function dynamically
   * Useful when function name is determined at runtime
   *
   * Supports passing CallOptions as the last argument for transaction customization
   * (value, nonce, fees, chainId, permissionId, data, etc.)
   *
   * @param functionName - The name of the function to call
   * @param args - Arguments to pass to the function (last arg can be CallOptions)
   *
   * @example
   * ```typescript
   * // Basic call
   * const result = await contract.call('transfer', toAddress, amount)
   *
   * // With CallOptions
   * const result = await contract.call('transfer', toAddress, amount, {
   *   value: parseKLV('1'),
   *   nonce: 123,
   *   fees: { kAppFee: 100 }
   * })
   * ```
   */
  async call<T = unknown>(functionName: string, ...args: unknown[]): Promise<T> {
    if (!this.hasFunction(functionName)) {
      throw new Error(`Function ${functionName} does not exist in contract`)
    }

    const fn = this[functionName] as (...args: unknown[]) => Promise<T>
    return fn(...args)
  }

  /**
   * Invoke a mutable contract function (state-changing transaction)
   * This method explicitly requires the function to be mutable.
   *
   * Supports passing CallOptions as the last argument for transaction customization
   * (value, nonce, fees, chainId, permissionId, data, etc.)
   *
   * @param functionName - The name of the mutable function to invoke
   * @param args - Arguments to pass to the function (last arg can be CallOptions)
   * @returns Transaction submit result with hash and wait() method
   *
   * @example
   * ```typescript
   * // Basic invocation with individual args
   * const result = await contract.invoke('bet', betType, betValue)
   * await result.wait() // Wait for confirmation
   *
   * // With array of args (will be spread automatically)
   * const params = [betType, betValue]
   * const result = await contract.invoke('bet', ...params)
   *
   * // With CallOptions (value, nonce, fees, etc.)
   * const result = await contract.invoke('bet', betType, betValue, {
   *   value: parseKLV('10'), // Send 10 KLV with call
   *   nonce: 123,
   *   fees: { kAppFee: 100 }
   * })
   *
   * // With array of args AND CallOptions
   * const result = await contract.invoke('bet', ...params, {
   *   value: parseKLV('10')
   * })
   * ```
   */
  async invoke(functionName: string, ...args: unknown[]): Promise<TransactionSubmitResult> {
    if (!this.hasFunction(functionName)) {
      throw new Error(`Function ${functionName} does not exist in contract`)
    }

    // Ensure function is mutable (not readonly)
    if (this.interface.isReadonly(functionName)) {
      throw new Error(
        `Function ${functionName} is readonly. Use call() or callRaw() for queries instead.`,
      )
    }

    // Delegate to the dynamic call method which handles mutable functions
    return this.call<TransactionSubmitResult>(functionName, ...args)
  }

  /**
   * Query a contract function and return raw result (unparsed)
   *
   * This method is useful when you need access to the raw returnData from a contract query,
   * including metadata like returnCode, returnMessage, and gas information.
   *
   * @param functionName - The name of the readonly function to query
   * @param args - Arguments to pass to the function
   * @returns Raw query result with returnData, returnCode, returnMessage, and gas info
   *
   * @throws Error if the function is not readonly
   * @throws Error if the provider is not available
   * @throws Error if the contract query fails
   *
   * @example
   * ```typescript
   * // Query a contract and get raw results
   * const result = await contract.callRaw('getBalance', address)
   *
   * console.log(result.data?.returnData) // ['AQ==', 'BQ==']
   * console.log(result.data?.returnCode) // 'ok'
   * console.log(result.data?.gasRemaining) // 500000n
   * console.log(result.data?.returnMessage) // 'Success'
   * ```
   *
   * @see {@link call} for automatically decoded results
   * @see {@link invoke} for state-changing transactions
   */
  async callRaw(functionName: string, ...args: unknown[]): Promise<IContractQueryResult> {
    if (!this.hasFunction(functionName)) {
      throw new Error(`Function ${functionName} does not exist in contract`)
    }

    if (!this.provider) {
      throw new Error('Provider is required for query calls')
    }

    // Check if function is readonly
    if (!this.interface.isReadonly(functionName)) {
      throw new Error(`Function ${functionName} is not readonly. Use call() for transactions.`)
    }

    // Use the same encoding logic as _createQueryMethod
    const encodedArgs = this._encodeArguments(args, functionName)
    const base64Args = encodedArgs.map((arg) => Buffer.from(arg).toString('base64'))

    // Call queryContract from provider (same as _createQueryMethod)
    const result = await this.provider.queryContract({
      ScAddress: this.address,
      FuncName: functionName,
      Arguments: base64Args,
    })

    // Check for errors (same as _createQueryMethod)
    if (result.error) {
      throw new Error(`Contract query failed: ${result.error}`)
    }

    // Return raw result without decoding (different from _createQueryMethod)
    return result
  }

  /**
   * Connect contract to a different signer or provider
   *
   * Creates a new Contract instance with the same ABI and address but connected
   * to a different signer or provider. This is useful when you want to interact
   * with the same contract using different accounts.
   *
   * @param signerOrProvider - The signer or provider to connect to
   * @returns New Contract instance with the same ABI and address
   *
   * @example
   * ```typescript
   * const contract = new Contract(address, abi, wallet1)
   *
   * // Switch to a different wallet
   * const contract2 = contract.connect(wallet2)
   *
   * // Now transactions will be signed by wallet2
   * await contract2.transfer(toAddress, amount)
   * ```
   */
  connect(signerOrProvider: Signer | Provider): Contract {
    return new Contract(this.address, this.interface.abi, signerOrProvider)
  }

  /**
   * Attach contract to a different address
   *
   * Creates a new Contract instance with the same ABI but pointing to a different
   * contract address. This is useful when you have multiple instances of the same
   * contract deployed at different addresses.
   *
   * @param address - The new contract address
   * @returns New Contract instance with the same ABI but different address
   *
   * @example
   * ```typescript
   * const tokenABI = [...] // ERC20-like token ABI
   * const token1 = new Contract('klv1token1...', tokenABI, wallet)
   *
   * // Create a new instance pointing to a different token
   * const token2 = token1.attach('klv1token2...')
   *
   * // Both use the same ABI but interact with different contracts
   * const balance1 = await token1.balanceOf(address)
   * const balance2 = await token2.balanceOf(address)
   * ```
   */
  attach(address: string): Contract {
    return new Contract(address, this.interface.abi, this.signer || this.provider)
  }

  /**
   * Parse events from transaction logs
   *
   * @param logs - Transaction logs from a transaction response
   * @param filter - Optional filter to apply (identifier, address, topics)
   * @returns Array of parsed events
   *
   * @example
   * ```typescript
   * // Parse all events from a transaction
   * const tx = await provider.getTransaction(hash)
   * const events = contract.parseEvents(tx.logs)
   *
   * // Filter events by identifier
   * const betEvents = contract.parseEvents(tx.logs, {
   *   identifier: 'BetPlaced'
   * })
   *
   * // Filter events from this contract only
   * const contractEvents = contract.parseEvents(tx.logs, {
   *   address: contract.address
   * })
   * ```
   */
  parseEvents(logs?: TransactionLog, filter?: ContractEventFilter): ContractEvent[] {
    // If no address filter specified, filter by this contract's address
    const eventFilter: ContractEventFilter = {
      ...filter,
      address: filter?.address || this.address,
    }

    return EventParser.parseEvents(logs, eventFilter)
  }

  /**
   * Get unique event identifiers from transaction logs
   *
   * @param logs - Transaction logs
   * @returns Array of unique event identifiers
   */
  getEventIdentifiers(logs?: TransactionLog): string[] {
    return EventParser.getEventIdentifiers(logs)
  }

  /**
   * Get contract info
   */
  toString(): string {
    return `Contract(${this.address})`
  }
}
