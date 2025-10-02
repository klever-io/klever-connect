import type { Network } from './network'

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

export interface ProviderConfig {
  /**
   * Network configuration
   * Provides all necessary endpoints (API, node, WebSocket, explorer)
   * Use NETWORKS.mainnet, NETWORKS.testnet, or createCustomNetwork()
   */
  network?: Network
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
