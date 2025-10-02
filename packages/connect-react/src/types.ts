import type { KleverProvider, NetworkName, Network } from '@klever/connect-provider'
import type { Wallet } from '@klever/connect-wallet'

export interface KleverConfig {
  /**
   * Network to connect to.
   * - Use string for predefined networks: 'mainnet', 'testnet', 'devnet', 'local'
   * - Use Network object for custom networks with your own API endpoints
   * @default 'testnet'
   */
  network?: NetworkName | Network
  /**
   * Automatically connect on mount
   * @default false
   */
  autoConnect?: boolean
  /**
   * Reconnect if previously connected
   * @default false
   */
  reconnectOnMount?: boolean
  /**
   * Custom provider instance (overrides network config)
   */
  provider?: KleverProvider
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean
}

export interface KleverState {
  wallet?: Wallet
  provider: KleverProvider
  address?: string
  isConnected: boolean
  isConnecting: boolean
  error?: Error
  extensionInstalled?: boolean
  searchingExtension: boolean
  currentNetwork: NetworkName
}

export interface KleverContextValue extends KleverState {
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (network: NetworkName) => Promise<void>
}

export interface KleverProviderProps {
  children: React.ReactNode
  config?: KleverConfig
}
