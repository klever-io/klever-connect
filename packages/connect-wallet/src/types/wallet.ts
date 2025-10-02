import type { TXTypeValue } from '@klever/connect-core'
import type {
  Network,
  IBroadcastResult,
  IProvider,
  TransactionSubmitResult,
} from '@klever/connect-provider'
import type {
  AmountLike,
  TransferRequest as TxTransferRequest,
  Transaction,
} from '@klever/connect-transactions'

// Browser wallet extension API types (for KleverWeb extension communication)
export interface ExtensionTransactionPayload {
  // Transfer
  toAddress?: string
  amount?: AmountLike
  kda?: string

  // Asset operations
  assetId?: string
  receiver?: string

  // Staking
  bucketId?: string

  // Smart contract
  address?: string
  callValue?: unknown
  function?: string
  args?: unknown[]
  scType?: number

  // data
  data?: unknown

  // Generic
  [key: string]: unknown
}

export interface ExtensionTransactionRequest {
  type: TXTypeValue
  payload: ExtensionTransactionPayload
}

// Re-export transaction types with clear names
export type TransferRequest = TxTransferRequest

export interface WalletConfig {
  privateKey?: string
  network?: Network
  provider?: IProvider
}

export interface Wallet {
  readonly address: string
  readonly publicKey?: string

  // Connection management
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Signing
  signMessage(message: string | Uint8Array): Promise<string>
  signTransaction(tx: Transaction): Promise<Transaction>

  // Transactions
  transfer(params: TransferRequest): Promise<TransactionSubmitResult>
  sendTransaction?(
    type: TXTypeValue,
    payload: Record<string, unknown>,
  ): Promise<TransactionSubmitResult>

  broadcastTransaction?(tx: Transaction): Promise<IBroadcastResult>

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

export interface WalletFactory {
  createWallet(config?: WalletConfig): Promise<Wallet>
}
