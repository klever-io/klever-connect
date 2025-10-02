/**
 * Core constants for Klever Connect SDK
 */

// Native Asset
export const KLV_ASSET_ID = 'KLV'
export const KFI_ASSET_ID = 'KFI'
export const KLV_PRECISION = 6
export const KFI_PRECISION = 6
export const KLV_MULTIPLIER = 10 ** KLV_PRECISION
export const KFI_MULTIPLIER = 10 ** KFI_PRECISION
export const KLV_NAME = 'Klever'
export const KFI_NAME = 'Klever Finance'

export const BASE_TX_SIZE = 250

// Common assets on Klever
export const COMMON_ASSETS = {
  KLV: {
    id: KLV_ASSET_ID,
    precision: KLV_PRECISION,
    name: KLV_NAME,
  },
  KFI: {
    id: KFI_ASSET_ID,
    precision: KFI_PRECISION,
    name: KFI_NAME,
  },
}

// Address constants
export const ADDRESS_PREFIX = 'klv'
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
