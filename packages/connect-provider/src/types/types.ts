import type { KleverAddress, TransactionHash, BlockHash, AssetID } from '@klever/connect-core'

import type { Network } from '@klever/connect-core/src/types/network'
import type {
  IAccount,
  IBlockResponse,
  IReceipt,
  ITransactionResponse,
  IFeesResponse,
  IContractQueryParams,
  IContractQueryResult,
} from './api-types'
import type { ContractRequestData } from './contract-requests'

export interface TransactionReceipt {
  hash: TransactionHash
  status: string
  blockNumber: number
  timestamp: number
}

// Provider events
export type ProviderEvent =
  | 'block'
  | 'pending'
  | 'error'
  | 'debug'
  | { address: KleverAddress; topics: Array<string | null> }

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
  getTransaction(hash: TransactionHash): Promise<ITransactionResponse | null>
  getTransactionReceipt(hash: TransactionHash): Promise<IReceipt[] | null>
  getTransactionUrl(hash: TransactionHash): string
  getBalance(address: KleverAddress, assetId?: AssetID): Promise<bigint>
  getAccount(address: KleverAddress): Promise<IAccount>
  getNonce(address: KleverAddress): Promise<number>
  estimateFee(_tx: unknown): Promise<IFeesResponse>
  queryContract(params: IContractQueryParams): Promise<IContractQueryResult>
  sendRawTransaction(signedTx: string | Uint8Array | unknown): Promise<TransactionHash>
  sendRawTransactions(signedTxs: (string | Uint8Array | unknown)[]): Promise<TransactionHash[]>
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
  on(event: ProviderEvent, listener: (...args: unknown[]) => void): void
  off(event: ProviderEvent, listener: (...args: unknown[]) => void): void
  // JSON API specific methods
  call<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<T>
  // Transaction building
  buildTransaction(request: BuildTransactionRequest): Promise<BuildTransactionResponse>
}
