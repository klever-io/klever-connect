/**
 * Core constants for Klever Connect SDK
 */

import { ContractType } from '@klever/connect-encoding'

// Native asset
export const NATIVE_ASSET = 'KLV'
export const NATIVE_ASSET_PRECISION = 6

// Common assets on Klever
export const COMMON_ASSETS = {
  KLV: {
    id: 'KLV',
    precision: 6,
    name: 'Klever'
  },
  KFI: {
    id: 'KFI',
    precision: 6,
    name: 'Klever Finance'
  }
}

// Address constants
export const ADDRESS_PREFIX = 'klv'
export const VALIDATOR_PREFIX = 'klv'
export const ADDRESS_LENGTH = 62

// Transaction constants
export const MAX_MESSAGE_SIZE = 100 * 1024 // 100 KB
export const SIGNATURE_LENGTH = 64

// Staking constants
export const MIN_SELF_DELEGATION = 1000000000000n // 1,000,000 KLV
export const UNBONDING_TIME = 21 * 24 * 60 * 60 // 21 days in seconds
export const MAX_DELEGATORS_PER_VALIDATOR = 10000

// Block constants
export const BLOCK_TIME = 4 // seconds
export const BLOCKS_PER_EPOCH = 5400 // ~6 hours
export const BLOCKS_PER_YEAR = 7884000

// Limits
export const MAX_TX_SIZE = 32768 // 32KB
export const MAX_ASSET_NAME_LENGTH = 32
export const MAX_TICKER_LENGTH = 8

// Time constants
export const EPOCH_DURATION = 21600 // 6 hours in seconds
export const MILLISECONDS_PER_SECOND = 1000

// API limits
export const DEFAULT_PAGE_SIZE = 100
export const MAX_PAGE_SIZE = 1000
export const DEFAULT_TIMEOUT = 30000 // 30 seconds
export const DEFAULT_CONFIRMATIONS = 1

// WebSocket constants
export const WS_RECONNECT_DELAY = 1000
export const WS_MAX_RECONNECT_ATTEMPTS = 5
export const WS_PING_INTERVAL = 30000

// Error codes (similar to ethers.js)
export enum ErrorCode {
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  BAD_DATA = 'BAD_DATA',
  CANCELLED = 'CANCELLED',

  // Operational errors
  BUFFER_OVERRUN = 'BUFFER_OVERRUN',
  NUMERIC_FAULT = 'NUMERIC_FAULT',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  MISSING_ARGUMENT = 'MISSING_ARGUMENT',
  UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT',

  // Blockchain errors
  NONCE_EXPIRED = 'NONCE_EXPIRED',
  REPLACEMENT_UNDERPRICED = 'REPLACEMENT_UNDERPRICED',
  TRANSACTION_REPLACED = 'TRANSACTION_REPLACED',
  UNPREDICTABLE_GAS_LIMIT = 'UNPREDICTABLE_GAS_LIMIT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // User interaction errors
  ACTION_REJECTED = 'ACTION_REJECTED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'
}

// Logger levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  OFF = 'off'
}

// Re-export ContractType from encoding (source of truth from proto files)
export { ContractType } from '@klever/connect-encoding'

// Developer-friendly transaction type shortcuts
// Using literal values to avoid TypeScript type export issues
export const TXType = {
  Transfer: ContractType.TransferContractType,
  CreateAsset: ContractType.CreateAssetContractType,
  CreateValidator: ContractType.CreateValidatorContractType,
  ValidatorConfig: ContractType.ValidatorConfigContractType,
  Freeze: ContractType.FreezeContractType,
  Unfreeze: ContractType.UnfreezeContractType,
  Delegate: ContractType.DelegateContractType,
  Undelegate: ContractType.UndelegateContractType,
  Withdraw: ContractType.WithdrawContractType,
  Claim: ContractType.ClaimContractType,
  Unjail: ContractType.UnjailContractType,
  AssetTrigger: ContractType.AssetTriggerContractType,
  SetAccountName: ContractType.SetAccountNameContractType,
  Proposal: ContractType.ProposalContractType,
  Vote: ContractType.VoteContractType,
  ConfigITO: ContractType.ConfigITOContractType,
  SetITOPrices: ContractType.SetITOPricesContractType,
  Buy: ContractType.BuyContractType,
  Sell: ContractType.SellContractType,
  CancelMarketOrder: ContractType.CancelMarketOrderContractType,
  CreateMarketplace: ContractType.CreateMarketplaceContractType,
  ConfigMarketplace: ContractType.ConfigMarketplaceContractType,
  UpdateAccountPermission: ContractType.UpdateAccountPermissionContractType,
  Deposit: ContractType.DepositContractType,
  ITOTrigger: ContractType.ITOTriggerContractType,
  SmartContract: ContractType.SmartContractType
} as const

// Type for the TXType values
export type TXTypeValue = typeof TXType[keyof typeof TXType]


// Export helper to validate address format
export function isValidAddress(address: string): boolean {
  return address.startsWith(ADDRESS_PREFIX) && address.length === ADDRESS_LENGTH
}

// Export helper to validate validator address
export function isValidatorAddress(address: string): boolean {
  return address.startsWith(VALIDATOR_PREFIX) && address.length > VALIDATOR_PREFIX.length
}
