// Network configuration
export type NetworkName = 'mainnet' | 'testnet' | 'devnet' | 'local' | 'custom'

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

export interface Network {
  name: NetworkName
  chainId: string
  config: NetworkURI
  isTestnet: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

/**
 * Network configuration for KleverProvider
 * Can be:
 * - A string: 'mainnet', 'testnet', 'devnet', 'local'
 * - A Network object for custom networks
 */
export type NetworkConfig = NetworkName | NetworkURI | Network
