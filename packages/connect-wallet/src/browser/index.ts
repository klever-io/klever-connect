import { isBrowser, TXType, WalletError } from '@klever/connect-core'
import type {
  TransactionSubmitResult,
  IBroadcastResponse,
  IProvider,
  NetworkURI,
} from '@klever/connect-provider'
import type { KleverWeb, KleverHub } from '../types/browser-types'
import type { IContractRequest } from '../types/browser-types'

import type {
  TransferRequest,
  ExtensionTransactionRequest,
  ExtensionTransactionPayload,
} from '../types'
import { BaseWallet } from '../base'
import type { Transaction } from '@klever/connect-transactions'

export class BrowserWallet extends BaseWallet {
  private _kleverWeb?: KleverWeb
  private _kleverHub?: KleverHub
  private _useExtensionBroadcast: boolean = true
  private _lastEmittedAddress?: string | undefined
  private _accountChangeDebounceTimer?: NodeJS.Timeout | undefined

  constructor(provider: IProvider) {
    super(provider)

    if (!isBrowser()) {
      throw new WalletError('BrowserWallet can only be used in browser environment')
    }
  }

  async connect(): Promise<void> {
    if (this._connected) {
      return
    }

    // Check for Klever Extension
    if (!window.kleverWeb) {
      throw new WalletError(
        'Klever Extension not found. Please install it from https://klever.io/extension',
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

  async disconnect(): Promise<void> {
    if (!this._connected) {
      return
    }

    try {
      // Clear any pending debounce timer
      if (this._accountChangeDebounceTimer) {
        clearTimeout(this._accountChangeDebounceTimer)
        this._accountChangeDebounceTimer = undefined
      }

      if (this._kleverHub) {
        await this._kleverHub.disconnect()
      }

      this._connected = false
      this._address = ''
      this._publicKey = ''
      this._lastEmittedAddress = undefined

      this.emit('disconnect')
    } catch (error) {
      throw new WalletError(
        `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    if (!this._connected || !this._kleverWeb) {
      throw new WalletError('Wallet not connected')
    }

    try {
      const messageStr =
        typeof message === 'string' ? message : Buffer.from(message).toString('hex')

      const signature = await this._kleverWeb.signMessage(messageStr)
      return signature
    } catch (error) {
      throw new WalletError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async signTransaction(unsignedTx: Transaction): Promise<Transaction> {
    if (!this._connected || !this._kleverWeb) {
      throw new WalletError('Wallet not connected')
    }

    try {
      // Sign transaction via extension
      return this._kleverWeb.signTransaction(unsignedTx)
    } catch (error) {
      throw new WalletError(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Build a transaction using the KleverWeb extension
   * @param requests Array of transaction requests
   * @param txData Optional transaction data
   * @param options Optional transaction options
   * @returns The built unsigned transaction
   */
  async buildTransaction(
    requests: ExtensionTransactionRequest[],
    txData?: string[],
    options?: { nonce?: number; kdaFee?: string },
  ): Promise<Transaction> {
    if (!this._connected || !this._kleverWeb) {
      throw new WalletError('Wallet not connected')
    }

    try {
      // Convert ExtensionTransactionRequest to IContractRequest format
      const contracts: IContractRequest[] = requests.map((req) => ({
        type: req.type,
        payload: req.payload,
      }))

      return await this._kleverWeb.buildTransaction(contracts, txData, options)
    } catch (error) {
      throw new WalletError(
        `Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Broadcast transactions using the KleverWeb extension
   * @param signedTxs Array of signed transactions
   * @returns Broadcast response
   */
  async broadcastTransactions(signedTxs: Transaction[]): Promise<IBroadcastResponse> {
    if (!this._connected || !this._kleverWeb) {
      throw new WalletError('Wallet not connected')
    }

    try {
      const response = await this._kleverWeb.broadcastTransactions(signedTxs)
      return response
    } catch (error) {
      throw new WalletError(
        `Failed to broadcast transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Build and sign a transfer transaction using KleverWeb
   * @param to Recipient address
   * @param amount Amount to transfer
   * @param token Optional token ID (defaults to KLV)
   * @returns Signed transaction
   */
  async buildTransfer(to: string, amount: string | number, token?: string): Promise<Transaction> {
    const request: ExtensionTransactionRequest = {
      type: TXType.Transfer,
      payload: {
        toAddress: to,
        receiver: to,
        amount: amount.toString(),
        ...(token && {
          kda: token,
          assetId: token, // Include both for compatibility
        }),
      },
    }

    const unsignedTx = await this.buildTransaction([request])
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb not available')
    }
    return await this._kleverWeb.signTransaction(unsignedTx)
  }

  /**
   * Get the extension's provider configuration
   */
  getExtensionProvider(): NetworkURI {
    return this._kleverWeb?.getProvider() ?? {}
  }

  /**
   * Update the extension's provider for network switching
   * @param provider The new provider configuration
   */
  updateProvider(provider: NetworkURI): void {
    if (!this._kleverWeb) {
      throw new WalletError('KleverWeb not available')
    }

    // Directly update the provider object on the extension
    this._kleverWeb.provider = provider
  }

  /**
   * Send a generic transaction using the extension
   */
  async sendTransaction(
    type: number,
    payload: ExtensionTransactionPayload,
  ): Promise<TransactionSubmitResult> {
    if (!this._connected || !this._kleverWeb) {
      throw new WalletError('Wallet not connected')
    }

    try {
      let txData: string[] | undefined
      const txPayload = payload
      /* {
        function?: string
        args?: string[]
        data?: string | string[]
      }*/

      // Handle transaction data
      if (type === 63) {
        // SmartContract type
        // Build call input for smart contract
        if (txPayload.function && txPayload.args) {
          // Build the method call data
          const dataString =
            txPayload.args.length > 0
              ? `${txPayload.function}@${txPayload.args.join('@')}`
              : txPayload.function

          // Convert to base64
          const callInput =
            typeof Buffer !== 'undefined'
              ? Buffer.from(dataString).toString('base64')
              : btoa(dataString)

          txData = [callInput]
        }
      } else if (txPayload.data) {
        // Handle regular transaction data
        if (Array.isArray(txPayload.data)) {
          txData = txPayload.data
        } else if (typeof txPayload.data === 'string') {
          txData = [txPayload.data]
        }
      }

      // Build the transaction payload (remove non-standard fields)
      const standardPayload: ExtensionTransactionPayload = {}

      // Copy standard fields
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

      for (const field of standardFields) {
        if (field in txPayload) {
          const value = (txPayload as Record<string, unknown>)[field]
          if (value !== undefined) {
            ;(standardPayload as Record<string, unknown>)[field] = value
          }
        }
      }

      // Build transaction
      const unsignedTx = await this.buildTransaction(
        [
          {
            type,
            payload: standardPayload,
          },
        ],
        txData,
      )

      // Sign transaction
      const signedTx = await this._kleverWeb.signTransaction(unsignedTx)

      // Broadcast transaction
      const response = await this.broadcastTransactions([signedTx])

      if (!response) {
        throw new Error('Failed to broadcast transaction')
      }

      if (response.error) {
        throw new Error(response.error)
      }

      const txHash = response.data?.hash || response.data?.txsHashes?.[0] || ''

      return {
        hash: txHash,
        status: 'pending',
        //transaction: unsignedTx,
      }
    } catch (error) {
      throw new WalletError(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Override the base transfer method to use extension when available
   */
  override async transfer(params: TransferRequest): Promise<TransactionSubmitResult> {
    // If extension supports building transactions and we want to use it
    if (this._useExtensionBroadcast && this._kleverWeb) {
      try {
        // buildTransfer already builds and signs the transaction
        const signedTx = await this.buildTransfer(
          params.receiver,
          params.amount.toString(),
          params.kda,
        )
        const response = await this.broadcastTransactions([signedTx])

        if (response.error) {
          throw new Error(response.error)
        }

        const txHash = response.data?.hash || response.data?.txsHashes?.[0] || ''

        return {
          hash: txHash,
          status: 'pending',
          // transaction: signedTx,
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
