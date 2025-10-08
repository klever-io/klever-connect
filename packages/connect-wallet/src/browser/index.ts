import { isBrowser, TXType, WalletError } from '@klever/connect-core'
import type { KleverAddress, TransactionHash } from '@klever/connect-core'
import type {
  ContractRequestData,
  TransferRequest,
  TransactionSubmitResult,
  IProvider,
  NetworkURI,
} from '@klever/connect-provider'
import { Transaction } from '@klever/connect-transactions'
import type { PrivateKey, Signature } from '@klever/connect-crypto'
import { cryptoProvider, SignatureImpl } from '@klever/connect-crypto'
import type { KleverWeb, KleverHub, IContractRequest } from '../types/browser-types'
import type { WalletConfig } from '../types/wallet'
import { BaseWallet } from '../base'

export class BrowserWallet extends BaseWallet {
  private _kleverWeb?: KleverWeb
  private _kleverHub?: KleverHub
  private _privateKey?: PrivateKey | undefined
  private _mode: 'extension' | 'privateKey' = 'extension'
  private _useExtensionBroadcast: boolean = true
  private _lastEmittedAddress?: string | undefined
  private _accountChangeDebounceTimer?: NodeJS.Timeout | undefined

  constructor(provider: IProvider, config?: WalletConfig) {
    super(provider)

    if (!isBrowser()) {
      throw new WalletError('BrowserWallet can only be used in browser environment')
    }

    // Initialize private key mode if provided
    if (config?.privateKey) {
      this._mode = 'privateKey'
      this._privateKey = cryptoProvider.importPrivateKey(config.privateKey)
    } else if (config?.pemContent) {
      this._mode = 'privateKey'
      // Import PEM using crypto package's loader (async, will be done in connect())
      // Store pemContent temporarily for loading in connect()
      if (config.pemPassword !== undefined) {
        this._pendingPemLoad = {
          content: config.pemContent,
          password: config.pemPassword,
        }
      } else {
        this._pendingPemLoad = {
          content: config.pemContent,
        }
      }
    }
  }

  private _pendingPemLoad?:
    | {
        content: string
        password?: string
      }
    | undefined

  async connect(): Promise<void> {
    if (this._connected) {
      return
    }

    // Private key mode - direct connection without extension
    if (this._mode === 'privateKey') {
      try {
        // Load PEM if pending
        if (this._pendingPemLoad && !this._privateKey) {
          const pemResult = await cryptoProvider.importPrivateKeyFromPem(
            this._pendingPemLoad.content,
            this._pendingPemLoad.password ? { password: this._pendingPemLoad.password } : undefined,
          )
          this._privateKey = pemResult
          // PEM loader returns PrivateKey with validated address
          // Get address from public key
          const publicKey = await cryptoProvider.getPublicKey(pemResult)
          this._address = publicKey.toAddress()
          this._pendingPemLoad = undefined // Clear after loading
        }

        if (!this._privateKey) {
          throw new WalletError('No private key provided')
        }

        // Generate address from private key (if not already set from PEM)
        if (!this._address) {
          const publicKey = await cryptoProvider.getPublicKey(this._privateKey)
          this._publicKey = publicKey.toHex()
          this._address = publicKey.toAddress()
        } else {
          // PEM mode - still get public key
          const publicKey = await cryptoProvider.getPublicKey(this._privateKey)
          this._publicKey = publicKey.toHex()
        }

        this._connected = true
        this.emit('connect', { address: this._address })
        return
      } catch (error) {
        throw new WalletError(
          `Failed to connect with private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    // Extension mode - check for Klever Extension
    if (!window.kleverWeb) {
      throw new WalletError(
        'Klever Extension not found. Please install it from https://klever.io/extension, or provide a private key.',
      )
    }

    this._kleverWeb = window.kleverWeb
    if (window.kleverHub) {
      this._kleverHub = window.kleverHub
    }

    try {
      // Initialize KleverHub if available
      if (this._kleverHub) {
        await this._kleverHub.initialize()

        // Set up account change listener with debouncing
        this._kleverHub.onAccountChanged((event) => {
          // Clear any pending debounce timer
          if (this._accountChangeDebounceTimer) {
            clearTimeout(this._accountChangeDebounceTimer)
          }

          // Debounce the event to prevent rapid firing
          this._accountChangeDebounceTimer = setTimeout(() => {
            // Check if it's a KLV chain (chain === 'KLV' or chain === 1)
            if (event.chain === 'KLV' || event.chain === 1) {
              // Only emit if address actually changed
              if (event.address !== this._lastEmittedAddress) {
                this._address = event.address
                this._lastEmittedAddress = event.address
                this.emit('accountChanged', { address: event.address, chain: event.chain })
              }
            } else {
              // Different chain selected, treat as disconnect
              this._connected = false
              this._address = ''
              this._lastEmittedAddress = undefined
              this.emit('disconnect')
            }
          }, 100) // 100ms debounce delay
        })
      }

      // Get the wallet address from the extension
      const address = this._kleverWeb.getWalletAddress()

      if (!address) {
        throw new WalletError(
          'No wallet address set in Klever Extension. Please connect your wallet in the extension.',
        )
      }

      this._address = address
      this._connected = true

      this.emit('connect', { address: this._address })
    } catch (error) {
      throw new WalletError(
        `Failed to connect to Klever Extension: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Disconnect from the wallet
   * @param clearPrivateKey - In private key mode, whether to clear the private key from memory (default: false)
   *                          If false, you can reconnect without providing the key again
   *                          If true, you'll need to create a new wallet instance to reconnect
   */
  async disconnect(clearPrivateKey: boolean = false): Promise<void> {
    if (!this._connected) {
      return
    }

    try {
      // Clear any pending debounce timer
      if (this._accountChangeDebounceTimer) {
        clearTimeout(this._accountChangeDebounceTimer)
        this._accountChangeDebounceTimer = undefined
      }

      // Extension mode - disconnect from hub
      if (this._mode === 'extension' && this._kleverHub) {
        await this._kleverHub.disconnect()
      }

      // Clear connection state
      this._connected = false
      this._address = ''
      this._publicKey = ''
      this._lastEmittedAddress = undefined

      // Private key mode: Optionally clear private key for security
      if (clearPrivateKey && this._mode === 'privateKey') {
        this._privateKey = undefined
        this._pendingPemLoad = undefined
      }

      this.emit('disconnect')
    } catch (error) {
      throw new WalletError(
        `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async signMessage(message: string | Uint8Array): Promise<Signature> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    // Private key mode - sign locally
    if (this._mode === 'privateKey') {
      if (!this._privateKey) {
        throw new WalletError('No private key available')
      }

      try {
        const messageBytes =
          typeof message === 'string' ? new TextEncoder().encode(message) : message
        const signature = await cryptoProvider.signMessage(messageBytes, this._privateKey)
        return signature
      } catch (error) {
        throw new WalletError(
          `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    // Extension mode - use KleverWeb (returns string signature)
    if (!this._kleverWeb) {
      throw new WalletError('Extension not available')
    }

    try {
      const messageStr =
        typeof message === 'string' ? message : Buffer.from(message).toString('hex')

      const signatureStr = await this._kleverWeb.signMessage(messageStr)
      // Extension returns hex or base64 - try both
      try {
        return SignatureImpl.fromHex(signatureStr)
      } catch {
        return SignatureImpl.fromBase64(signatureStr)
      }
    } catch (error) {
      throw new WalletError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async signTransaction(unsignedTx: Transaction): Promise<Transaction> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    // Private key mode - sign locally using Transaction.sign()
    if (this._mode === 'privateKey') {
      if (!this._privateKey) {
        throw new WalletError('No private key available')
      }

      try {
        await unsignedTx.sign(this._privateKey)
        return unsignedTx
      } catch (error) {
        throw new WalletError(
          `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    // Extension mode - use KleverWeb
    if (!this._kleverWeb) {
      throw new WalletError('Extension not available')
    }

    try {
      // Sign transaction via extension
      const result = await this._kleverWeb.signTransaction(unsignedTx.toJSON())
      return Transaction.fromTransaction(result)
    } catch (error) {
      throw new WalletError(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Build a transaction
   * In extension mode: Uses KleverWeb extension
   * In private key mode: Uses TransactionBuilder with provider
   * @param contracts Array of contract requests
   * @param txData Optional transaction data
   * @param options Optional transaction options
   * @returns The built unsigned transaction
   */
  async buildTransaction(
    contracts: ContractRequestData[],
    txData?: string[],
    options?: { nonce?: number; kdaFee?: string },
  ): Promise<Transaction> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    // Private key mode - use TransactionBuilder
    if (this._mode === 'privateKey') {
      try {
        const { TransactionBuilder } = await import('@klever/connect-transactions')
        const builder = new TransactionBuilder(this._provider)

        // Add all contracts
        for (const contract of contracts) {
          builder.addContract(contract)
        }

        // Set sender
        builder.sender(this._address)

        // Set nonce if provided, otherwise auto-fetch
        if (options?.nonce !== undefined) {
          builder.nonce(options.nonce)
        }

        // Build the transaction
        return await builder.build()
      } catch (error) {
        throw new WalletError(
          `Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    // Extension mode - use KleverWeb
    if (!this._kleverWeb) {
      throw new WalletError('Extension not available')
    }

    try {
      // KleverWeb accepts contracts with 'type' field and deconstructs payload internally
      // Since it converts { type, payload } back to { ...payload, contractType: type },
      // we can pass ContractRequestData directly by aliasing contractType as type
      const extensionContracts = contracts.map((contract) => ({
        type: contract.contractType,
        payload: contract,
      })) as IContractRequest[]

      return await this._kleverWeb.buildTransaction(extensionContracts, txData, options)
    } catch (error) {
      throw new WalletError(
        `Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Broadcast multiple signed transactions to the network in a single batch
   * In extension mode: Uses KleverWeb extension
   * In private key mode: Uses provider.sendRawTransactions
   * @param signedTxs Array of signed transactions
   * @returns Array of transaction hashes
   */
  override async broadcastTransactions(signedTxs: Transaction[]): Promise<TransactionHash[]> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    // Private key mode - use provider
    if (this._mode === 'privateKey') {
      // Use the base class implementation which calls provider.sendRawTransactions
      return super.broadcastTransactions(signedTxs)
    }

    // Extension mode - use KleverWeb
    if (!this._kleverWeb) {
      throw new WalletError('Extension not available')
    }

    try {
      const response = await this._kleverWeb.broadcastTransactions(signedTxs)

      // Extract hashes from extension response
      if (response.error) {
        throw new WalletError(response.error)
      }

      if (response.data?.txsHashes) {
        return response.data.txsHashes as TransactionHash[]
      }

      // Fallback: compute hashes locally if extension didn't return them
      return signedTxs.map((tx) => tx.getHash() as TransactionHash)
    } catch (error) {
      throw new WalletError(
        `Failed to broadcast transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Build and sign a transfer transaction
   * In extension mode: Uses KleverWeb extension
   * In private key mode: Uses TransactionBuilder + local signing
   * @param to - Recipient address
   * @param amount - Amount to transfer
   * @param token - Optional token ID (defaults to KLV)
   * @returns Signed transaction
   */
  async buildTransfer(to: string, amount: string | number, token?: string): Promise<Transaction> {
    const contract: ContractRequestData = {
      contractType: TXType.Transfer,
      toAddress: to,
      receiver: to,
      amount: amount.toString(),
      ...(token && {
        kda: token,
        assetId: token, // Include both for compatibility
      }),
    } as ContractRequestData

    const unsignedTx = await this.buildTransaction([contract])

    // Private key mode - sign locally
    if (this._mode === 'privateKey') {
      return await this.signTransaction(unsignedTx)
    }

    // Extension mode - sign with extension
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb not available')
    }
    return await this._kleverWeb.signTransaction(unsignedTx)
  }

  /**
   * Get the extension's current provider configuration
   * @returns Network URI configuration from the extension
   */
  getExtensionProvider(): NetworkURI {
    return this._kleverWeb?.getProvider() ?? {}
  }

  /**
   * Update the extension's provider for network switching
   * @param provider - The new provider configuration
   */
  updateProvider(provider: NetworkURI): void {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb not available')
    }

    // Directly update the provider object on the extension
    this._kleverWeb.provider = provider
  }

  /**
   * Create a new account using the extension
   * Extension mode only
   * @returns PEM response with private key and address
   */
  async createAccount(): Promise<{ privateKey: string; address: string }> {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb extension not available')
    }

    try {
      return await this._kleverWeb.createAccount()
    } catch (error) {
      throw new WalletError(
        `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Get account information
   * In extension mode: Uses KleverWeb extension
   * In private key mode: Uses provider
   * @param address - Optional address to query (defaults to current wallet address)
   * @returns Account information
   */
  async getAccount(address?: string): Promise<{
    address: string
    balance?: number
    nonce?: number
    allowance?: number
    permissions?: string[]
    rootHash?: string
    txCount?: number
  }> {
    const queryAddress = address || this._address

    if (!queryAddress) {
      throw new WalletError('No address available')
    }

    // Private key mode - use provider
    if (this._mode === 'privateKey') {
      try {
        const account = await this._provider.getAccount(queryAddress as KleverAddress)
        return {
          address: account.address,
          balance: Number(account.balance),
          nonce: account.nonce,
          // Provider may not return all these fields
        }
      } catch (error) {
        throw new WalletError(
          `Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    // Extension mode - use KleverWeb
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb extension not available')
    }

    try {
      return await this._kleverWeb.getAccount(address)
    } catch (error) {
      throw new WalletError(
        `Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Parse PEM file data using the extension
   * Extension mode only
   * @param pemData - PEM file content
   * @returns Private key and address from PEM
   */
  async parsePemFileData(pemData: string): Promise<{ privateKey: string; address: string }> {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb extension not available')
    }

    try {
      return await this._kleverWeb.parsePemFileData(pemData)
    } catch (error) {
      throw new WalletError(
        `Failed to parse PEM data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Set the wallet address in the extension
   * Extension mode only
   * @param address - Address to set
   */
  async setWalletAddress(address: string): Promise<void> {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb extension not available')
    }

    try {
      await this._kleverWeb.setWalletAddress(address)
      this._address = address
    } catch (error) {
      throw new WalletError(
        `Failed to set wallet address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Set a private key in the extension
   * Extension mode only
   * @param privateKey - Private key to set
   */
  async setPrivateKey(privateKey: string): Promise<void> {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb extension not available')
    }

    try {
      await this._kleverWeb.setPrivateKey(privateKey)
    } catch (error) {
      throw new WalletError(
        `Failed to set private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Validate a signature using the extension
   * Extension mode only
   * @param payload - Signature payload to validate
   * @returns Validation result with signer information
   */
  async validateSignature(payload: string): Promise<{ isValid: boolean; signer?: string }> {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb extension not available')
    }

    try {
      return await this._kleverWeb.validateSignature(payload)
    } catch (error) {
      throw new WalletError(
        `Failed to validate signature: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Extract transaction data from contract payload
   * Handles smart contract calls and regular transaction data
   */
  private extractTxData(
    contractType: number,
    payload: Record<string, unknown>,
  ): string[] | undefined {
    if (contractType === 63) {
      // SmartContract type - build call input
      const func = payload['function']
      const args = payload['args']
      if (func && args && Array.isArray(args)) {
        const dataString = args.length > 0 ? `${String(func)}@${args.join('@')}` : String(func)
        const callInput =
          typeof Buffer !== 'undefined'
            ? Buffer.from(dataString).toString('base64')
            : btoa(dataString)
        return [callInput]
      }
    } else {
      // Regular transaction data
      const data = payload['data']
      if (data) {
        return Array.isArray(data) ? (data as string[]) : [data as string]
      }
    }
    return undefined
  }

  /**
   * Build standard payload from contract data
   * Filters out non-standard fields like function/args/data
   */
  private buildStandardPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const standardFields = [
      'toAddress',
      'amount',
      'kda',
      'kdaId',
      'assetId',
      'ticker',
      'ownerAddress',
      'precision',
      'initialSupply',
      'maxSupply',
      'blsPublicKey',
      'canDelegate',
      'commission',
      'rewardAddress',
      'bucketId',
      'address',
      'callValue',
      'scType',
      'marketplaceId',
      'currencyId',
      'price',
      'orderType',
      'message',
      'receiver',
    ]

    const standardPayload: Record<string, unknown> = {}
    for (const field of standardFields) {
      if (field in payload) {
        const value = payload[field]
        if (value !== undefined) {
          standardPayload[field] = value
        }
      }
    }
    return standardPayload
  }

  /**
   * Send a generic transaction
   * In extension mode: Uses KleverWeb extension for building and broadcasting
   * In private key mode: Uses base implementation (local signing + provider broadcast)
   */
  override async sendTransaction(contract: ContractRequestData): Promise<TransactionSubmitResult> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    // Private key mode - use base implementation (local signing)
    if (this._mode === 'privateKey') {
      return super.sendTransaction(contract)
    }

    // Extension mode - use KleverWeb
    if (!this._kleverWeb) {
      throw new WalletError('Extension not available')
    }

    try {
      const { contractType, ...payload } = contract
      const txPayload = payload as Record<string, unknown>

      // Extract transaction data
      const txData = this.extractTxData(contractType, txPayload)

      // Build standard payload
      const standardPayload = this.buildStandardPayload(txPayload)

      // Build transaction using extension
      const unsignedTx = await this.buildTransaction(
        [{ contractType, ...standardPayload } as ContractRequestData],
        txData,
      )

      // Sign transaction
      const signedTx = await this._kleverWeb.signTransaction(unsignedTx)

      // Broadcast transaction
      const hashes = await this.broadcastTransactions([signedTx])

      if (!hashes || hashes.length === 0) {
        throw new WalletError('Failed to broadcast transaction')
      }

      const hash = hashes[0]
      if (!hash) {
        throw new WalletError('Invalid transaction hash')
      }

      return {
        hash,
        status: 'pending',
      }
    } catch (error) {
      throw new WalletError(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Transfer tokens to another address
   * In extension mode: Uses KleverWeb extension
   * In private key mode: Uses base implementation
   */
  override async transfer(params: TransferRequest): Promise<TransactionSubmitResult> {
    // Private key mode - use base implementation
    if (this._mode === 'privateKey') {
      return super.transfer(params)
    }

    // Extension mode with broadcast support
    if (this._useExtensionBroadcast && this._kleverWeb) {
      try {
        // buildTransfer already builds and signs the transaction
        const signedTx = await this.buildTransfer(
          params.receiver,
          params.amount.toString(),
          params.kda,
        )
        const hashes = await this.broadcastTransactions([signedTx])

        if (!hashes || hashes.length === 0) {
          throw new WalletError('Failed to broadcast transaction')
        }

        const hash = hashes[0]
        if (!hash) {
          throw new WalletError('Invalid transaction hash')
        }

        return {
          hash,
          status: 'pending',
        }
      } catch (error) {
        // Fallback to regular provider broadcast
        console.warn('Extension broadcast failed, falling back to provider:', error)
      }
    }

    // Use the default implementation
    return super.transfer(params)
  }
}
