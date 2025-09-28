import type { NetworkName, Network } from './types/network'

// Network configurations (similar to ethers.js)
export const NETWORKS: Record<NetworkName, Network> = {
    mainnet: {
        name: 'mainnet',
        chainId: 108,
        apiUrl: 'https://api.mainnet.klever.org',
        wsUrl: 'wss://api.mainnet.klever.org',
        explorerUrl: 'https://kleverscan.org',
        isTestnet: false,
        nativeCurrency: {
            name: 'Klever',
            symbol: 'KLV',
            decimals: 6
        }
    },
    testnet: {
        name: 'testnet',
        chainId: 109,
        apiUrl: 'https://api.testnet.klever.org',
        wsUrl: 'wss://api.testnet.klever.org',
        explorerUrl: 'https://testnet.kleverscan.org',
        isTestnet: true,
        nativeCurrency: {
            name: 'Klever',
            symbol: 'KLV',
            decimals: 6
        }
    },
    devnet: {
        name: 'devnet',
        chainId: 10001,
        apiUrl: 'https://api.devnet.klever.org',
        wsUrl: 'wss://api.devnet.klever.org',
        explorerUrl: 'https://devnet.kleverscan.org',
        isTestnet: true,
        nativeCurrency: {
            name: 'Klever',
            symbol: 'KLV',
            decimals: 6
        }
    },
    local: {
        name: 'local',
        chainId: 420420,
        apiUrl: 'http://localhost:8080',
        wsUrl: 'ws://localhost:8080',
        explorerUrl: 'http://localhost:3000',
        isTestnet: true,
        nativeCurrency: {
            name: 'Klever',
            symbol: 'KLV',
            decimals: 6
        }
    },
    custom: {
        name: 'custom',
        chainId: 420420,
        apiUrl: '',  // User must provide
        wsUrl: '',   // User must provide
        explorerUrl: '',
        isTestnet: true,
        nativeCurrency: {
            name: 'Klever',
            symbol: 'KLV',
            decimals: 6
        }
    }
}

// Default network
export const DEFAULT_NETWORK: NetworkName = 'mainnet'



// Export helper to get network by chain ID
export function getNetworkByChainId(chainId: number): Network | undefined {
    return Object.values(NETWORKS).find(network => network.chainId === chainId)
}

// Export helper to create custom network configuration
export function createCustomNetwork(config: {
    chainId: number
    apiUrl: string
    wsUrl?: string
    explorerUrl?: string
    isTestnet?: boolean
}): Network {
    return {
        name: 'custom',
        chainId: config.chainId,
        apiUrl: config.apiUrl,
        wsUrl: config.wsUrl || '',
        explorerUrl: config.explorerUrl || '',
        isTestnet: config.isTestnet ?? true,
        nativeCurrency: {
            name: 'Klever',
            symbol: 'KLV',
            decimals: 6
        }
    }
}

