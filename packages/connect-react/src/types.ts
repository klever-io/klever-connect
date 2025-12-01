import type { KleverProvider, NetworkName, Network } from '@klever/connect-provider'
import type { IWallet } from '@klever/connect-wallet'

/**
 * Configuration options for KleverProvider
 */
export interface KleverConfig {
  /**
   * Network to connect to.
   * - Use string for predefined networks: 'mainnet', 'testnet', 'devnet', 'local'
   * - Use Network object for custom networks with your own API endpoints
   * @default 'testnet'
   */
  network?: NetworkName | Network
  /**
   * Automatically connect wallet on mount
   * @default false
   */
  autoConnect?: boolean
  /**
   * Reconnect wallet if previously connected (checks localStorage)
   * @default false
   */
  reconnectOnMount?: boolean
  /**
   * Custom provider instance (overrides network config)
   * If provided, network option is ignored
   */
  provider?: KleverProvider
  /**
   * Enable debug logging for development
   * @default false
   */
  debug?: boolean
}

/**
 * Internal state managed by KleverProvider
 */
export interface KleverState {
  /** Connected wallet instance (undefined if not connected) */
  wallet?: IWallet
  /** KleverProvider instance for blockchain queries */
  provider: KleverProvider
  /** Connected wallet address (undefined if not connected) */
  address?: string
  /** Whether wallet is currently connected */
  isConnected: boolean
  /** Whether connection is in progress */
  isConnecting: boolean
  /** Error from last operation (undefined if no error) */
  error?: Error
  /** Whether Klever Web Extension is installed */
  extensionInstalled?: boolean
  /** Whether extension detection is in progress */
  searchingExtension: boolean
  /** Current network name */
  currentNetwork: NetworkName
}

/**
 * Context value provided by KleverProvider and consumed by useKlever hook
 * Extends KleverState with control methods
 */
export interface KleverContextValue extends KleverState {
  /**
   * Initiate wallet connection
   * - Detects and connects to Klever Web Extension
   * - Sets up event listeners for account changes
   * - Persists connection state to localStorage
   * - Updates provider to match current network
   */
  connect: () => Promise<void>
  /**
   * Disconnect wallet
   * - Removes all event listeners
   * - Clears wallet state
   * - Removes connection state from localStorage
   */
  disconnect: () => void
  /**
   * Switch to a different network
   * - Changes blockchain network without disconnecting
   * - Updates provider instance
   * - Updates extension provider if using BrowserWallet
   * - Persists network selection to localStorage
   * @param network - Network name to switch to
   */
  switchNetwork: (network: NetworkName) => Promise<void>
}

/**
 * Props for KleverProvider component
 */
export interface KleverProviderProps {
  /** Child components that will have access to Klever context */
  children: React.ReactNode
  /** Optional configuration for the provider */
  config?: KleverConfig
}
