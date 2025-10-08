/**
 * Core constants for Klever Connect SDK
 */

// ==================== Native Asset Constants ====================

/**
 * Asset ID for Klever's native token (KLV)
 * Used as the identifier for KLV in all transactions and balances
 * @example 'KLV'
 */
export const KLV_ASSET_ID = 'KLV'

/**
 * Asset ID for Klever Finance token (KFI)
 * Used as the identifier for KFI in all transactions and balances
 * @example 'KFI'
 */
export const KFI_ASSET_ID = 'KFI'

/**
 * Number of decimal places for KLV token
 * KLV uses 6 decimals, so 1 KLV = 1,000,000 smallest units
 * @example 6
 * @see {@link KLV_MULTIPLIER} for the multiplier value
 */
export const KLV_PRECISION = 6

/**
 * Number of decimal places for KFI token
 * KFI uses 6 decimals, so 1 KFI = 1,000,000 smallest units
 * @example 6
 * @see {@link KFI_MULTIPLIER} for the multiplier value
 */
export const KFI_PRECISION = 6

/**
 * Multiplier to convert KLV to smallest units
 * Equals 1,000,000 (10^6) since KLV has 6 decimal places
 * @example 1000000
 * @see {@link KLV_PRECISION}
 */
export const KLV_MULTIPLIER = 10 ** KLV_PRECISION

/**
 * Multiplier to convert KFI to smallest units
 * Equals 1,000,000 (10^6) since KFI has 6 decimal places
 * @example 1000000
 * @see {@link KFI_PRECISION}
 */
export const KFI_MULTIPLIER = 10 ** KFI_PRECISION

/**
 * Display name for Klever token
 * @example 'Klever'
 */
export const KLV_NAME = 'Klever'

/**
 * Display name for Klever Finance token
 * @example 'Klever Finance'
 */
export const KFI_NAME = 'Klever Finance'

/**
 * Base transaction size in bytes used for fee estimation
 * Represents the approximate minimum size of a transaction
 * @example 250
 */
export const BASE_TX_SIZE = 250

/**
 * Common assets configuration on Klever blockchain
 * Provides metadata for the main native tokens (KLV and KFI)
 *
 * @example
 * ```typescript
 * const klvInfo = COMMON_ASSETS.KLV
 * console.log(klvInfo.id) // 'KLV'
 * console.log(klvInfo.precision) // 6
 * console.log(klvInfo.name) // 'Klever'
 * ```
 */
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

// ==================== Address Constants ====================

/**
 * Bech32 prefix for Klever addresses
 * All Klever addresses start with 'klv1'
 * @example 'klv'
 * @see {@link ADDRESS_LENGTH} for the full address length
 */
export const ADDRESS_PREFIX = 'klv'

/**
 * Total length of a Klever address in characters
 * Klever addresses are exactly 62 characters long (including 'klv1' prefix)
 * Format: klv1 (4 chars) + 58 bech32 encoded chars = 62 total
 * @example 62
 * @see {@link ADDRESS_PREFIX}
 */
export const ADDRESS_LENGTH = 62

// ==================== Transaction Constants ====================

/**
 * Maximum size for transaction message/data field in bytes
 * Equals 100 KB (102,400 bytes)
 * @example 102400
 */
export const MAX_MESSAGE_SIZE = 100 * 1024 // 100 KB

/**
 * Length of transaction signatures in bytes
 * Klever uses 64-byte signatures
 * @example 64
 */
export const SIGNATURE_LENGTH = 64

// ==================== Staking Constants ====================

/**
 * Minimum self-delegation required to create a validator
 * Equals 1,000,000 KLV (1,000,000,000,000 in smallest units)
 * @example 1000000000000n
 */
export const MIN_SELF_DELEGATION = 1000000000000n // 1,000,000 KLV

/**
 * Time period in seconds for unbonding delegated tokens
 * Equals 21 days (1,814,400 seconds)
 * After undelegating, tokens are locked for this period before being available
 * @example 1814400
 */
export const UNBONDING_TIME = 21 * 24 * 60 * 60 // 21 days in seconds

/**
 * Maximum number of delegators that can delegate to a single validator
 * @example 10000
 */
export const MAX_DELEGATORS_PER_VALIDATOR = 10000

// ==================== Block Constants ====================

/**
 * Average block time in seconds
 * Klever blockchain produces a new block approximately every 4 seconds
 * @example 4
 * @see {@link BLOCKS_PER_EPOCH}
 */
export const BLOCK_TIME = 4 // seconds

/**
 * Number of blocks in one epoch
 * Equals 5,400 blocks (approximately 6 hours at 4 seconds per block)
 * @example 5400
 * @see {@link BLOCK_TIME}, {@link EPOCH_DURATION}
 */
export const BLOCKS_PER_EPOCH = 5400 // ~6 hours

/**
 * Number of blocks produced in one year
 * Used for APY calculations and reward estimations
 * @example 7884000
 */
export const BLOCKS_PER_YEAR = 7884000

// ==================== Size Limits ====================

/**
 * Maximum transaction size in bytes
 * Equals 32 KB (32,768 bytes)
 * Transactions exceeding this size will be rejected
 * @example 32768
 */
export const MAX_TX_SIZE = 32768 // 32KB

/**
 * Maximum length for asset names
 * Asset names cannot exceed 32 characters
 * @example 32
 * @see {@link MAX_TICKER_LENGTH}
 */
export const MAX_ASSET_NAME_LENGTH = 32

/**
 * Maximum length for asset ticker symbols
 * Ticker symbols cannot exceed 8 characters
 * @example 8
 * @see {@link MAX_ASSET_NAME_LENGTH}
 */
export const MAX_TICKER_LENGTH = 8

// ==================== Time Constants ====================

/**
 * Duration of one epoch in seconds
 * Equals 6 hours (21,600 seconds)
 * @example 21600
 * @see {@link BLOCKS_PER_EPOCH}
 */
export const EPOCH_DURATION = 21600 // 6 hours in seconds

/**
 * Number of milliseconds in one second
 * Utility constant for time conversions
 * @example 1000
 */
export const MILLISECONDS_PER_SECOND = 1000

// ==================== API Limits ====================

/**
 * Default number of items per page in paginated API responses
 * @example 100
 * @see {@link MAX_PAGE_SIZE}
 */
export const DEFAULT_PAGE_SIZE = 100

/**
 * Maximum number of items per page in paginated API responses
 * @example 1000
 * @see {@link DEFAULT_PAGE_SIZE}
 */
export const MAX_PAGE_SIZE = 1000

/**
 * Default timeout for API requests in milliseconds
 * Equals 30 seconds (30,000 milliseconds)
 * @example 30000
 */
export const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * Default number of block confirmations to wait for transaction finality
 * @example 1
 */
export const DEFAULT_CONFIRMATIONS = 1

// ==================== WebSocket Constants ====================

/**
 * Delay in milliseconds before attempting to reconnect after WebSocket disconnect
 * @example 1000
 * @see {@link WS_MAX_RECONNECT_ATTEMPTS}
 */
export const WS_RECONNECT_DELAY = 1000

/**
 * Maximum number of reconnection attempts for WebSocket connections
 * After this many failed attempts, the connection will be abandoned
 * @example 5
 * @see {@link WS_RECONNECT_DELAY}
 */
export const WS_MAX_RECONNECT_ATTEMPTS = 5

/**
 * Interval in milliseconds between WebSocket ping messages
 * Used to keep the connection alive and detect disconnections
 * Equals 30 seconds (30,000 milliseconds)
 * @example 30000
 */
export const WS_PING_INTERVAL = 30000
