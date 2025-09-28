
// Network configuration
export type NetworkName = 'mainnet' | 'testnet' | 'devnet' | 'local' | 'custom'

export interface Network {
    name: NetworkName
    chainId: number
    apiUrl: string  // JSON API endpoint
    wsUrl?: string
    explorerUrl?: string
    isTestnet: boolean
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
}
