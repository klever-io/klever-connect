declare const brand: unique symbol

export type Brand<T, TBrand> = T & { [brand]: TBrand }

export type KleverAddress = Brand<string, 'KleverAddress'>
export type TransactionHash = Brand<string, 'TransactionHash'>
export type BlockHash = Brand<string, 'BlockHash'>
export type PublicKey = Brand<string, 'PublicKey'>
export type PrivateKey = Brand<string, 'PrivateKey'>
export type Signature = Brand<string, 'Signature'>
export type HexString = Brand<string, 'HexString'>
export type Base58String = Brand<string, 'Base58String'>

export interface Network {
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface TransactionRequest {
  from: KleverAddress
  to?: KleverAddress
  value?: bigint
  data?: HexString
  nonce?: number
  gasLimit?: bigint
  gasPrice?: bigint
}

export interface TransactionReceipt {
  hash: TransactionHash
  blockHash: BlockHash
  blockNumber: number
  from: KleverAddress
  to?: KleverAddress
  status: boolean
  gasUsed: bigint
  logs: Log[]
}

export interface Log {
  address: KleverAddress
  topics: HexString[]
  data: HexString
  blockNumber: number
  transactionHash: TransactionHash
  transactionIndex: number
  logIndex: number
}

export interface Block {
  hash: BlockHash
  parentHash: BlockHash
  number: number
  timestamp: number
  nonce: string
  difficulty: bigint
  gasLimit: bigint
  gasUsed: bigint
  miner: KleverAddress
  transactions: TransactionHash[]
}

export interface Account {
  address: KleverAddress
  balance: bigint
  nonce: number
}