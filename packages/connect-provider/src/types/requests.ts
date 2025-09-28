import type {
    KleverAddress,
    TransactionHash,
    TXTypeValue,
    BlockHash,
    AssetID,
} from "@klever/connect-core";

import type { IAccount, IBlockResponse, IReceipt, ITransaction } from "./api-types";

export interface TransactionRequestPayload {
    // Transfer
    toAddress?: string
    amount?: number | string
    kda?: string
    kdaId?: string

    // Asset operations
    assetId?: string
    ticker?: string
    ownerAddress?: string
    precision?: number
    initialSupply?: number | string
    maxSupply?: number | string

    // Validator operations
    blsPublicKey?: string
    canDelegate?: boolean
    commission?: number
    rewardAddress?: string

    // Staking operations
    bucketId?: string

    // Smart contract
    address?: string
    callValue?: unknown
    function?: string
    args?: unknown[]
    scType?: number

    // Market operations
    marketplaceId?: string
    currencyId?: string
    price?: number | string
    orderType?: string

    // Generic fields
    data?: unknown
    message?: string
    receiver?: string
}

// Transaction structure
export interface TransactionRequest {
    type?: TXTypeValue
    payload: TransactionRequestPayload
    // Optional fields
    sender?: string
    nonce?: number
    permissionId?: number
    kdaFee?: string
}

// Provider events
export type ProviderEvent =
    | 'block'
    | 'pending'
    | 'error'
    | 'debug'
    | { address: KleverAddress; topics: Array<string | null> }


import type { Network } from "./network";

// Block identifier type - can be a hash, number, or 'latest'
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type BlockIdentifier = BlockHash | number | 'latest'

// Provider types (JSON API based, not RPC)
export interface ProviderLike {
    getNetwork(): Promise<Network>
    getBlockNumber(): Promise<number>
    getBlock(blockHashOrNumber: BlockIdentifier): Promise<IBlockResponse>
    getTransaction(hash: TransactionHash): Promise<ITransaction | null>
    getTransactionReceipt(hash: TransactionHash): Promise<IReceipt | null>
    getBalance(address: KleverAddress, assetId?: AssetID): Promise<bigint>
    getAccount(address: KleverAddress): Promise<IAccount>
    estimateFee(tx: TransactionRequest): Promise<bigint>
    sendRawTransaction(signedTx: string | Uint8Array): Promise<TransactionHash>
    waitForTransaction(hash: TransactionHash, confirmations?: number): Promise<ITransaction | null>
    on(event: ProviderEvent, listener: (...args: unknown[]) => void): void
    off(event: ProviderEvent, listener: (...args: unknown[]) => void): void
    // JSON API specific methods
    call<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<T>
}

// Contract types
export interface ContractInterface {
    abi: unknown
    functions: Record<string, FunctionFragment>
    events: Record<string, EventFragment>
}

export interface FunctionFragment {
    name: string
    inputs: ParamType[]
    outputs: ParamType[]
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
}

export interface EventFragment {
    name: string
    anonymous: boolean
    inputs: ParamType[]
}

export interface ParamType {
    name: string
    type: string
    indexed?: boolean
    components?: ParamType[]
}

// Block tag types for filtering
export type BlockTag = 'earliest' | 'latest' | 'pending'

// Options for various operations
export interface TransactionOptions {
    nonce?: number
    kdaFee?: bigint
    bandwidthFee?: bigint
    message?: string | Uint8Array
}

export interface CallOptions {
    from?: KleverAddress
    blockTag?: number | BlockTag
}

export interface FilterOptions {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    address?: KleverAddress | KleverAddress[]
    topics?: Array<string | string[] | null>
    fromBlock?: number | BlockTag
    toBlock?: number | Exclude<BlockTag, 'earliest'>
}

// Pagination
export interface PaginationOptions {
    limit?: number
    offset?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}
