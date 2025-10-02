import type { KleverAddress } from '@klever/connect-core'
import type { TransactionSubmitResult, IProvider } from '@klever/connect-provider'

import type { Wallet, WalletEvent, WalletEventHandler } from '../types'
import type { TransferRequest, Transaction } from '@klever/connect-transactions'

export abstract class BaseWallet implements Wallet {
  protected _provider: IProvider
  protected _address: string = ''
  protected _publicKey: string = ''
  protected _connected: boolean = false
  protected _events: Map<WalletEvent, Set<WalletEventHandler>> = new Map()

  constructor(provider: IProvider) {
    this._provider = provider
  }

  get address(): string {
    return this._address
  }

  get publicKey(): string {
    return this._publicKey
  }

  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract signMessage(message: string | Uint8Array): Promise<string>
  abstract signTransaction(unsignedTx: Transaction): Promise<Transaction>

  isConnected(): boolean {
    return this._connected
  }

  async getBalance(): Promise<bigint> {
    if (!this._connected || !this._address) {
      throw new Error('Wallet not connected')
    }

    const account = await this._provider.getAccount(this._address as KleverAddress)
    return account.balance
  }

  async getNonce(): Promise<number> {
    if (!this._connected || !this._address) {
      throw new Error('Wallet not connected')
    }

    const account = await this._provider.getAccount(this._address as KleverAddress)
    return account.nonce
  }

  async transfer(_params: TransferRequest): Promise<TransactionSubmitResult> {
    if (!this._connected) {
      throw new Error('Wallet not connected')
    }

    // TODO: Build transaction using transaction builder
    // For now, return a placeholder
    throw new Error('Transfer not implemented yet - requires transaction builder')
  }

  on(event: WalletEvent, handler: WalletEventHandler): void {
    const handlers = this._events.get(event) ?? new Set()
    handlers.add(handler)
    this._events.set(event, handlers)
  }

  off(event: WalletEvent, handler: WalletEventHandler): void {
    const handlers = this._events.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

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
