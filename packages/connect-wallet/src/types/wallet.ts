import type { TransactionHash } from '@klever/connect-core'
import type {
  Network,
  IProvider,
  TransactionSubmitResult,
  ContractRequestData,
  TransferRequest,
} from '@klever/connect-provider'
import type { Transaction } from '@klever/connect-transactions'
import type { Signature } from '@klever/connect-crypto'

// Re-export for convenience (single source of truth is @klever/connect-provider)
export type { TransferRequest }

export interface WalletConfig {
  privateKey?: string
  pemContent?: string
  pemPassword?: string
  network?: Network
  provider?: IProvider
}

export interface IWallet {
  readonly address: string
  readonly publicKey?: string
  readonly provider?: IProvider

  // Connection management
  connect(): Promise<void>
  disconnect(clearPrivateKey?: boolean): Promise<void>
  isConnected(): boolean

  // Signing
  signMessage(message: string | Uint8Array): Promise<Signature>
  signTransaction(tx: Transaction): Promise<Transaction>

  // Transactions
  transfer(params: TransferRequest): Promise<TransactionSubmitResult>
  /**
   * Send any transaction type with properly typed parameters
   * @param contract - Complete contract request with contractType and parameters
   * @example
   * ```typescript
   * await wallet.sendTransaction({
   *   contractType: 0,  // Transfer
   *   receiver: 'klv1...',
   *   amount: 1000000
   * })
   * ```
   */
  sendTransaction?(contract: ContractRequestData): Promise<TransactionSubmitResult>

  broadcastTransaction?(tx: Transaction): Promise<TransactionHash>
  broadcastTransactions?(txs: Transaction[]): Promise<TransactionHash[]>

  // Account info
  getBalance(): Promise<bigint>
  getNonce(): Promise<number>

  // Events
  on(event: WalletEvent, handler: WalletEventHandler): void
  off(event: WalletEvent, handler: WalletEventHandler): void
  removeAllListeners(event?: WalletEvent): void
}

export type WalletEvent = 'connect' | 'disconnect' | 'accountChanged'

export type WalletEventHandler = (data: unknown) => void

export type Wallet = IWallet

export interface WalletFactory {
  createWallet(config?: WalletConfig): Promise<IWallet>
}
