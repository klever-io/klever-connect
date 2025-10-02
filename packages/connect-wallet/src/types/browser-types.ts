import type { TXTypeValue } from '@klever/connect-core'

import type { IBroadcastResponse, NetworkURI } from '@klever/connect-provider'

import type { Transaction } from '@klever/connect-transactions'

export interface IPemResponse {
  privateKey: string
  address: string
}

export interface IAccount {
  address: string
  balance?: number
  nonce?: number
  allowance?: number
  permissions?: string[]
  rootHash?: string
  txCount?: number
}

export interface IVerifyResponse {
  isValid: boolean
  signer?: string
}

export interface IContractRequest {
  type: TXTypeValue
  payload?: unknown
}

export interface ITxOptionsRequest {
  nonce?: number
  kdaFee?: string
  kAppFee?: number
  bandwidthFee?: number
  message?: string
}

// Browser extension interface
export interface KleverWeb {
  address: string
  provider: NetworkURI

  createAccount(): Promise<IPemResponse>
  getAccount(address?: string): Promise<IAccount>

  parsePemFileData(pemData: string): Promise<IPemResponse>

  broadcastTransactions(payload: Transaction[]): Promise<IBroadcastResponse>
  signTransaction(payload: Transaction): Promise<Transaction>

  setWalletAddress(payload: string): Promise<void>
  setPrivateKey(payload: string): Promise<void>

  getWalletAddress(): string
  getProvider(): NetworkURI

  signMessage(payload: string): Promise<string>
  validateSignature(payload: string): Promise<IVerifyResponse>
  buildTransaction(
    contracts: IContractRequest[],
    txData?: string[],
    options?: ITxOptionsRequest,
  ): Promise<Transaction>
}

export interface KleverHub {
  initialize: () => Promise<void>
  onAccountChanged: (callback: (event: { chain: string | number; address: string }) => void) => void
  disconnect: () => Promise<void>
}

// Global window interface
declare global {
  interface Window {
    kleverWeb?: KleverWeb
    kleverHub?: KleverHub
  }
}
