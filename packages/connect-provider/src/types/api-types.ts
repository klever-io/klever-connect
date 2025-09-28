
export interface IAccount {
    address: string
    balance: bigint
    nonce: number
    assets?: IAssetBalance[]
}

export interface IAssetBalance {
    assetId: string
    balance: bigint
}

export interface IBalance {
    address: string
    token: string
    amount: bigint
    decimals: number
}

export interface IBroadcastResult {
    hash: string
    code?: string
    message?: string
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

export interface IFaucetResult {
    txHash: string
    status: string
}

export interface IContractData {
    type: number
    typeString: string
    parameter: Record<string, unknown>
}

export enum TransactionStatus {
    Pending = 'pending',
    Success = 'success',
    Failed = 'failed',
    Invalid = 'invalid',
}

export interface ITransactionLog {
    address: string
    contractId?: number
    timestamp?: number
    events: ILogEvent[]
}

export interface ILogEvent {
    address: string
    identifier: string
    topics: string[]
    data: string[]
}

export interface IFees {
    KAppFee: number
    BandwidthFee: number
    TotalFee: number
}

export interface IReceipt {
    type?: number
    typeString?: string
    cID?: number
    [key: string]: unknown
}

export interface ITransaction {
    hash: string
    blockNum: number
    sender: string
    nonce: number
    timestamp: number
    kAppFee: number
    bandwidthFee: number
    totalFee: number
    status: TransactionStatus
    resultCode?: string
    version: number
    chainID: string
    signature: string[]
    contract?: IContractData[]
    data?: string[]
    receipts?: IReceipt[]
    logs?: ITransactionLog
    hasLogs?: boolean
    hasOperations?: boolean
}

/**
 * Klever API Response Types
 */

// Common Response Wrapper
export interface ApiResponse<T> {
    data: T
    pagination?: Pagination
    error: string
    code: string
}

export interface Pagination {
    self: number
    next: number
    previous: number
    perPage: number
    totalPages: number
    totalRecords: number
}

// Account/Address Response
export interface AddressResponse {
    account: {
        address: string
        nonce: number
        balance: number
        frozenBalance: number
        unfrozenBalance: number
        allowance: number
        permissions: string[]
        timestamp: number
        assets: Record<string, ApiAssetBalance>
    }
}

export interface ApiAssetBalance {
    assetId: string
    assetName?: string
    assetType?: string
    balance: number
    frozenBalance?: number
    unfrozenBalance?: number
    collection?: string
    precision?: number
}

// Transaction Response
export interface ITransactionListResponse {
    transactions: ITransaction[]
}

// Transaction API Response wrapper
export interface ITransactionApiResponse {
    transaction: ITransaction
}

// Broadcast Response (Node API)
export interface IBroadcastResponse {
    data?: {
        txHash: string
        hash?: string
    }
    error?: string
    code?: string
    message?: string
}

// Block Response
export interface IBlockResponse {
    hash: string
    height: number
    timestamp: number
    txCount: number
    proposer: string
    size: number
    stateRoot: string
    payloadHash: string
    protocolVersion: string
    chainID: string
    signature: string
    transactions?: ITransaction[]
}

// Asset/Token Response
export interface IAssetResponse {
    assetId: string
    assetName: string
    assetType: string
    ownerAddress: string
    logo?: string
    uris?: Record<string, string>
    precision: number
    circulatingSupply: string
    maxSupply: string
    marketCap?: string
    verified?: boolean
    hidden?: boolean
    attributes?: Record<string, unknown>
}

// Network Info Response
export interface INetworkResponse {
    nodeVersion: string
    apiVersion: string
    chainID: string
    currentBlockHeight: number
    currentBlockHash: string
    genesisBlockHash: string
    protocolVersion: string
}

// Staking/Delegation Response
export interface IStakingResponse {
    frozenBalance: number
    unfrozenBalance: number
    claimableBalance: number
    delegate?: {
        to: string
        amount: number
    }
}

// Validator Response
export interface IValidatorResponse {
    address: string
    name?: string
    rating: number
    jailed: boolean
    totalStake: string
    selfStake: string
    delegatedStake: string
    commission: number
    maxDelegation: string
    website?: string
    logo?: string
    details?: string
}

// Contract Query Response
export interface IContractQueryResponse {
    data?: {
        returnData?: string[]
        returnCode?: string
        returnMessage?: string
        gasRemaining?: number
        gasRefund?: number
    }
    error?: string
    code?: string
}

// Faucet Response
export interface IFaucetResponse {
    data?: {
        txHash: string
        status: string
    }
    error?: string
    code?: string
}

// Market/Exchange Data
export interface IMarketResponse {
    marketId: string
    baseAsset: string
    quoteAsset: string
    lastPrice: string
    priceChange24h: string
    volume24h: string
    high24h: string
    low24h: string
}

export interface ITypedValue {
    type: string
    value: string
}
