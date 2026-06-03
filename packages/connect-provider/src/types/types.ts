import type { KleverAddress, TransactionHash, BlockHash, AssetID } from '@klever/connect-core'

import type { Network } from '@klever/connect-core'
import type {
  IAccount,
  IBlockResponse,
  IReceipt,
  ITransactionResponse,
  ITransactionListResponse,
  IFeesResponse,
  IContractQueryParams,
  IContractQueryResult,
} from './api-types'
import type { ContractRequestData } from './contract-requests'

/**
 * Options for filtering and paginating transaction queries.
 */
export interface GetTransactionsOptions {
  /** Page number for pagination (1-based). */
  page?: number
  /** Maximum number of transactions to return per page. */
  limit?: number
  /** Filter by transaction type. */
  type?: string
  /** Filter by transaction status. */
  status?: string
  /** Filter by asset identifier. */
  asset?: string
  /** Filter by transaction nonce. */
  nonce?: number
  /** Filter by block number. */
  blockNum?: number
  /** Restrict results to transactions where the address is sender or receiver. */
  role?: 'sender' | 'receiver'
  /** Filter by start date. */
  startDate?: string
  /** Filter by end date. */
  endDate?: string
  /** Filter by order identifier. */
  orderId?: string
  /** Filter by marketplace identifier. */
  marketplaceId?: string
  /** Sort order for results. */
  orderBy?: 'asc' | 'desc'
  /** Include receipt details in the response. */
  withResults?: boolean
  /** Include internal transactions in the response. */
  withInternal?: boolean
  /** Bypass the local cache and force a fresh API request. */
  skipCache?: boolean
}

export interface TransactionReceipt {
  hash: TransactionHash
  status: string
  blockNumber: number
  timestamp: number
}

export interface BlockEventData {
  blockNumber: number
  hash?: string
  timestamp?: number
}

export interface PendingEventData {
  hash: string
  from: string
}

export interface ProviderError {
  code: string
  message: string
  originalError?: Error | undefined
}

export interface ProviderEventMap {
  block: BlockEventData
  pending: PendingEventData
  error: ProviderError
  connect: void
  disconnect: void
}

// Provider events
export type ProviderEvent = keyof ProviderEventMap

export interface WsEventMessage {
  type: string
  address: string
  hash: string
  data?: unknown
}

// Block identifier type - can be a hash, number, or 'latest'
export type BlockIdentifier = BlockHash | number | 'latest'

/**
 * Transaction build request for node endpoint
 * Used for building transactions server-side with the node handling nonce, fees, and encoding
 */
export interface BuildTransactionRequest {
  sender?: string
  nonce?: number
  contracts: ContractRequestData[]
  kdaFee?: string
  permissionId?: number
  data?: string[]
}

/**
 * Transaction build response from node endpoint
 * Contains the proto transaction object and transaction hash
 */
export interface BuildTransactionResponse {
  result: unknown // Proto transaction object (ITransaction)
  txHash: string
}

// Provider types (JSON API based, not RPC)
export interface IProvider {
  readonly network: Network

  getNetwork(): Network
  getBlockNumber(): Promise<number>
  getBlock(blockHashOrNumber: BlockIdentifier): Promise<IBlockResponse | null>
  getTransaction(
    hash: TransactionHash | string,
    options?: { skipCache?: boolean },
  ): Promise<ITransactionResponse | null>
  getTransactions(
    address: KleverAddress,
    options?: GetTransactionsOptions,
  ): Promise<ITransactionListResponse>
  getTransactionReceipt(hash: TransactionHash | string): Promise<IReceipt[] | null>
  getTransactionUrl(hash: TransactionHash | string): string
  getBalance(address: KleverAddress, assetId?: AssetID): Promise<bigint>
  getAccount(address: KleverAddress): Promise<IAccount>
  getNonce(address: KleverAddress): Promise<number>
  estimateFee(_tx: unknown): Promise<IFeesResponse>
  queryContract(params: IContractQueryParams): Promise<IContractQueryResult>
  sendRawTransaction(signedTx: string | Uint8Array | unknown): Promise<TransactionHash>
  sendRawTransactions(signedTxs: (string | Uint8Array | unknown)[]): Promise<TransactionHash[]>
  waitForTransaction(
    hash: TransactionHash | string,
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
  on<K extends keyof ProviderEventMap>(
    event: K,
    listener: (data: ProviderEventMap[K]) => void,
  ): void
  off<K extends keyof ProviderEventMap>(
    event: K,
    listener: (data: ProviderEventMap[K]) => void,
  ): void
  once<K extends keyof ProviderEventMap>(
    event: K,
    listener: (data: ProviderEventMap[K]) => void,
  ): void
  removeAllListeners<K extends keyof ProviderEventMap>(event?: K): void
  connect?(): void
  disconnect?(): void
  // JSON API specific methods
  call<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<T>
  // Transaction building
  buildTransaction(request: BuildTransactionRequest): Promise<BuildTransactionResponse>
}
