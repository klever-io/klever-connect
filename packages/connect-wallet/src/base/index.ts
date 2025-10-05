import { WalletError, isValidAddress } from '@klever/connect-core'
import type { KleverAddress } from '@klever/connect-core'
import type {
  TransactionSubmitResult,
  IProvider,
  TransferRequest,
  ContractRequestData,
} from '@klever/connect-provider'
import type { Transaction } from '@klever/connect-transactions'
import { TransactionBuilder } from '@klever/connect-transactions'

import type { Wallet, WalletEvent, WalletEventHandler } from '../types'
import type { TransactionHash } from '@klever/connect-core'

/**
 * Base wallet implementation providing common functionality
 * All wallet implementations should extend this class
 */
export abstract class BaseWallet implements Wallet {
  protected _provider: IProvider
  protected _address: string = ''
  protected _publicKey: string = ''
  protected _connected: boolean = false
  protected _events: Map<WalletEvent, Set<WalletEventHandler>> = new Map()

  constructor(provider: IProvider) {
    this._provider = provider
  }

  /** Wallet address (bech32 format) */
  get address(): string {
    return this._address
  }

  /** Public key (hex format) */
  get publicKey(): string {
    return this._publicKey
  }

  /** Connect to the wallet */
  abstract connect(): Promise<void>

  /** Disconnect from the wallet */
  abstract disconnect(clearPrivateKey?: boolean): Promise<void>

  /** Sign a message with the wallet's private key */
  abstract signMessage(message: string | Uint8Array): Promise<string>

  /** Sign a transaction with the wallet's private key */
  abstract signTransaction(unsignedTx: Transaction): Promise<Transaction>

  /**
   * Check if wallet is connected
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this._connected
  }

  /**
   * Get wallet balance
   * @returns Balance in smallest units (KLV has 6 decimals)
   */
  async getBalance(): Promise<bigint> {
    if (!this._connected || !this._address) {
      throw new WalletError('Wallet not connected')
    }

    if (!isValidAddress(this._address)) {
      throw new WalletError('Invalid wallet address')
    }

    const account = await this._provider.getAccount(this._address as KleverAddress)
    return account.balance
  }

  /**
   * Get current nonce for the wallet
   * Used for transaction ordering
   * @returns Current nonce value
   */
  async getNonce(): Promise<number> {
    if (!this._connected || !this._address) {
      throw new WalletError('Wallet not connected')
    }

    if (!isValidAddress(this._address)) {
      throw new WalletError('Invalid wallet address')
    }

    const account = await this._provider.getAccount(this._address as KleverAddress)
    return account.nonce
  }

  /**
   * Broadcast a single signed transaction to the network
   * Default implementation uses the provider's sendRawTransaction method
   * Can be overridden by child classes for custom behavior (e.g., extension broadcasting)
   */
  async broadcastTransaction(tx: Transaction): Promise<TransactionHash> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    if (!tx.isSigned()) {
      throw new WalletError('Transaction must be signed before broadcasting')
    }

    return this._provider.sendRawTransaction(tx.toJSON())
  }

  /**
   * Broadcast multiple signed transactions to the network in a single batch
   * Default implementation uses the provider's sendRawTransactions method
   * Can be overridden by child classes for custom behavior (e.g., extension broadcasting)
   */
  async broadcastTransactions(txs: Transaction[]): Promise<TransactionHash[]> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    const submit = txs.map((tx) => {
      if (!tx.isSigned()) {
        throw new WalletError('All transactions must be signed before broadcasting')
      }
      return tx.toJSON()
    })

    return this._provider.sendRawTransactions(submit)
  }

  /**
   * Send a transaction with any contract type
   * Builds, signs, and broadcasts the transaction
   * Can be overridden by child classes (e.g., BrowserWallet uses extension)
   */
  async sendTransaction(contract: ContractRequestData): Promise<TransactionSubmitResult> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    try {
      // Build transaction using TransactionBuilder
      const builder = new TransactionBuilder(this._provider)
      builder.addContract(contract).sender(this._address)

      const unsignedTx = await builder.build()

      // Sign transaction
      const signedTx = await this.signTransaction(unsignedTx)

      // Broadcast transaction
      const hash = await this.broadcastTransaction(signedTx)

      // Return standardized result
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
   * Convenience method that uses sendTransaction internally
   */
  async transfer(params: TransferRequest): Promise<TransactionSubmitResult> {
    if (!this._connected) {
      throw new WalletError('Wallet not connected')
    }

    try {
      // Build transaction using TransactionBuilder
      const builder = new TransactionBuilder(this._provider)
      builder.transfer(params).sender(this._address)

      const unsignedTx = await builder.build()

      // Sign transaction
      const signedTx = await this.signTransaction(unsignedTx)

      // Broadcast transaction
      const hash = await this.broadcastTransaction(signedTx)

      // Return standardized result
      return {
        hash,
        status: 'pending',
      }
    } catch (error) {
      throw new WalletError(
        `Failed to transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Register an event handler
   * @param event - Event name ('connect', 'disconnect', 'accountChanged')
   * @param handler - Event handler function
   */
  on(event: WalletEvent, handler: WalletEventHandler): void {
    const handlers = this._events.get(event) ?? new Set()
    handlers.add(handler)
    this._events.set(event, handlers)
  }

  /**
   * Unregister an event handler
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: WalletEvent, handler: WalletEventHandler): void {
    const handlers = this._events.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * Remove all event listeners for a specific event or all events
   * @param event - Optional event name. If not provided, removes all listeners for all events
   */
  removeAllListeners(event?: WalletEvent): void {
    if (event) {
      this._events.delete(event)
    } else {
      this._events.clear()
    }
  }

  protected emit(event: WalletEvent, data?: unknown): void {
    const handlers = this._events.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }
}
