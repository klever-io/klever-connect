import type { Network, NetworkName } from '@klever/connect-core/src/types/network'

export interface CacheOptions {
  /** Time to live in milliseconds (default: 15000ms = 15 seconds) */
  ttl?: number
  /** Maximum number of cached items (default: 100) */
  maxSize?: number
  /** Cache key prefix */
  prefix?: string
}

export interface RetryOptions {
  /** Maximum number of retries */
  maxRetries?: number
  /** Initial retry delay in milliseconds */
  retryDelay?: number
  /** Backoff strategy */
  backoff?: 'linear' | 'exponential'
  /** Custom retry condition */
  retryIf?: (error: Error) => boolean
}

/**
 * Custom network configuration shorthand
 * Use when you want to connect to a custom Klever node
 */
export interface CustomNetworkConfig {
  /** Custom node URL (required for custom networks) */
  url: string
  /** Chain ID of the custom network */
  chainId: string
  /** WebSocket URL for subscriptions (optional) */
  ws?: string
  /** Explorer URL (optional) */
  explorer?: string
  /** Whether this is a testnet (default: true for custom networks) */
  isTestnet?: boolean
}

/**
 * Full provider configuration object
 */
export interface ProviderConfigObject {
  /**
   * Network configuration
   * Can be:
   * - A network name: 'mainnet', 'testnet', 'devnet', 'local'
   * - A Network object: NETWORKS.mainnet, NETWORKS.testnet, or createCustomNetwork()
   */
  network?: NetworkName | Network
  /** Custom network configuration shorthand (alternative to network) */
  url?: string
  /** Chain ID when using custom URL */
  chainId?: string
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Number of retries for failed requests (deprecated, use retry.maxRetries) */
  retries?: number
  /** Custom headers for requests */
  headers?: Record<string, string>
  /** Cache configuration (default: enabled with 15s TTL) */
  cache?: CacheOptions | false
  /** Retry configuration (default: 3 retries with exponential backoff) */
  retry?: RetryOptions | false
  /** Enable debug logging (default: false) */
  debug?: boolean
}

/**
 * Provider configuration - can be:
 * - undefined: Uses mainnet
 * - A network name string: 'mainnet', 'testnet', 'devnet', 'local'
 * - A configuration object with network or custom URL
 */
export type ProviderConfig = NetworkName | ProviderConfigObject
