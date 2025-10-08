import type { NetworkName, Network, NetworkURI } from './types'

// Network configurations (similar to ethers.js)
export const NETWORKS: Record<NetworkName, Network> = {
  mainnet: {
    name: 'mainnet',
    chainId: '108',
    config: {
      api: 'https://api.mainnet.klever.org', // Indexer (fast, cached)
      node: 'https://node.mainnet.klever.org', // Direct node (raw, up-to-date)
      ws: 'wss://api.mainnet.klever.org',
      explorer: 'https://kleverscan.org',
    },
    isTestnet: false,
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: 6,
    },
  },
  testnet: {
    name: 'testnet',
    chainId: '109',
    config: {
      api: 'https://api.testnet.klever.org', // Indexer (fast, cached)
      node: 'https://node.testnet.klever.org', // Direct node (raw, up-to-date)
      ws: 'wss://api.testnet.klever.org',
      explorer: 'https://testnet.kleverscan.org',
    },
    isTestnet: true,
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: 6,
    },
  },
  devnet: {
    name: 'devnet',
    chainId: '10001',
    config: {
      api: 'https://api.devnet.klever.org', // Indexer (fast, cached)
      node: 'https://node.devnet.klever.org', // Direct node (raw, up-to-date)
      ws: 'wss://api.devnet.klever.org',
      explorer: 'https://devnet.kleverscan.org',
    },
    isTestnet: true,
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: 6,
    },
  },
  local: {
    name: 'local',
    chainId: '420420',
    config: {
      api: 'http://localhost:8080', // Indexer
      node: 'http://localhost:8080', // Node (same in local dev)
      ws: 'ws://localhost:8080',
      explorer: 'http://localhost:3000',
    },
    isTestnet: true,
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: 6,
    },
  },
  custom: {
    name: 'custom',
    chainId: '420420',
    config: {
      api: '', // User must provide
      ws: '', // User must provide
      explorer: '',
    },
    isTestnet: true,
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: 6,
    },
  },
}

// Default network
export const DEFAULT_NETWORK: NetworkName = 'mainnet'

// Export helper to get network by chain ID
export function getNetworkByChainId(chainId: string): Network | undefined {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId)
}

// Export helper to create custom network configuration
export function createCustomNetwork(config: {
  chainId: string
  api: string
  node: string
  ws?: string
  explorer?: string
  isTestnet?: boolean
}): Network {
  const networkConfig: NetworkURI = {
    api: config.api,
    node: config.node,
  }

  // Only add optional properties if they are explicitly provided
  if (config.ws !== undefined) networkConfig.ws = config.ws
  if (config.explorer !== undefined) networkConfig.explorer = config.explorer

  return {
    name: 'custom',
    chainId: config.chainId,
    config: networkConfig,
    isTestnet: config.isTestnet ?? true,
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: 6,
    },
  }
}

/**
 * Helper to resolve network configuration to a Network object
 */
export function resolveNetwork(network: NetworkName | Network): Network {
  if (typeof network === 'string') {
    const net = NETWORKS[network]
    if (!net) {
      throw new Error(`Unknown network: ${network}`)
    }
    return net
  }

  if (network && typeof network === 'object' && 'config' in network) {
    return network
  }

  throw new Error(`Unknown network`)
}

/**
 * Helper to get network name from a Network object
 */
export function getNetworkName(network: NetworkName | Network): NetworkName {
  if (typeof network === 'string') {
    const net = NETWORKS[network]
    if (!net) {
      throw new Error(`Unknown network: ${network}`)
    }
    return net.name
  }

  if (network && typeof network === 'object' && 'config' in network) {
    return network.name
  }

  throw new Error(`Unknown network`)
}

/**
 * Helper to get network configuration from a Network object
 * @param network
 * @returns
 */
export function getNetworkConfig(network: NetworkName | Network): NetworkURI {
  if (typeof network === 'string') {
    const net = NETWORKS[network]
    if (!net) {
      throw new Error(`Unknown network: ${network}`)
    }
    return net.config
  }

  if (network && typeof network === 'object' && 'config' in network) {
    return network.config
  }

  throw new Error(`Unknown network`)
}

/**
 * Helper to get network identifier for storage
 */
export function getNetworkIdentifier(network: NetworkName): string {
  const net = NETWORKS[network]
  if (!net) {
    throw new Error(`Unknown network: ${network}`)
  }
  return net.name === 'custom' ? `custom-${net.chainId}` : net.chainId
}
