/**
 * Network configuration types for Klever blockchain
 */

/**
 * Predefined network names supported by Klever
 *
 * @example
 * ```typescript
 * const network: NetworkName = 'mainnet'
 * const testNetwork: NetworkName = 'testnet'
 * ```
 */
export type NetworkName = 'mainnet' | 'testnet' | 'devnet' | 'local' | 'custom'

/**
 * Network endpoint URIs for connecting to Klever blockchain
 *
 * Provides different types of endpoints for various use cases:
 * - `api`: Fast, cached data from indexer (recommended for most queries)
 * - `node`: Direct node access for latest state
 * - `ws`: Real-time updates via WebSocket
 * - `explorer`: Block explorer for viewing blockchain data
 *
 * @example
 * ```typescript
 * const uris: NetworkURI = {
 *   api: 'https://api.mainnet.klever.finance',
 *   node: 'https://node.mainnet.klever.finance',
 *   ws: 'wss://ws.mainnet.klever.finance',
 *   explorer: 'https://kleverscan.org'
 * }
 * ```
 */
export interface NetworkURI {
  /** Indexer/Proxy API endpoint - provides indexed and parsed blockchain data (faster, cached) */
  api?: string
  /** Direct node API endpoint - raw blockchain node access (slower, but always up-to-date) */
  node?: string
  /** WebSocket endpoint for real-time updates and subscriptions */
  ws?: string
  /** Block explorer URL for viewing transactions and addresses */
  explorer?: string
}

/**
 * Complete network configuration with metadata
 *
 * Includes all information needed to connect to and interact with a Klever network.
 *
 * @example
 * ```typescript
 * const mainnet: Network = {
 *   name: 'mainnet',
 *   chainId: 'klever-mainnet',
 *   config: {
 *     api: 'https://api.mainnet.klever.finance',
 *     node: 'https://node.mainnet.klever.finance'
 *   },
 *   isTestnet: false,
 *   nativeCurrency: {
 *     name: 'Klever',
 *     symbol: 'KLV',
 *     decimals: 6
 *   }
 * }
 * ```
 */
export interface Network {
  /** Network name identifier */
  name: NetworkName
  /** Chain ID for this network */
  chainId: string
  /** Network endpoint configuration */
  config: NetworkURI
  /** Whether this is a test network */
  isTestnet: boolean
  /** Native currency information */
  nativeCurrency: {
    /** Full name of the currency */
    name: string
    /** Currency symbol/ticker */
    symbol: string
    /** Number of decimal places */
    decimals: number
  }
}

/**
 * Flexible network configuration for KleverProvider
 *
 * Accepts multiple formats for convenience:
 * - String name for predefined networks: `'mainnet'`, `'testnet'`, etc.
 * - NetworkURI object for custom endpoint configuration
 * - Full Network object for complete custom network setup
 *
 * @example
 * ```typescript
 * // Using predefined network name
 * const config1: NetworkConfig = 'mainnet'
 *
 * // Using custom URIs
 * const config2: NetworkConfig = {
 *   api: 'https://my-custom-api.com'
 * }
 *
 * // Using full network configuration
 * const config3: NetworkConfig = {
 *   name: 'custom',
 *   chainId: 'my-chain',
 *   config: { api: 'https://api.mychain.com' },
 *   isTestnet: true,
 *   nativeCurrency: { name: 'MyToken', symbol: 'MTK', decimals: 6 }
 * }
 * ```
 */
export type NetworkConfig = NetworkName | NetworkURI | Network
