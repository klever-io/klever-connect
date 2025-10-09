import type {
  KleverProvider as KleverProviderClass,
  Network,
  NetworkName,
} from '@klever/connect-provider'
import {
  KleverProvider as KleverProviderConstructor,
  resolveNetwork,
  getNetworkConfig,
  getNetworkName,
} from '@klever/connect-provider'
import { BrowserWallet, WalletFactory } from '@klever/connect-wallet'
import * as React from 'react'
import type { KleverContextValue, KleverProviderProps } from './types'
import { kleverReducer } from './reducer'

const KleverContext = React.createContext<KleverContextValue | undefined>(undefined)

/**
 * KleverProvider - Root provider component for Klever React integration
 *
 * Wraps your application to provide Klever blockchain connectivity, wallet management,
 * and network switching capabilities. All child components can access Klever functionality
 * via the `useKlever()` hook.
 *
 * @param children - React components that will have access to Klever context
 * @param config - Optional configuration object for the provider
 *
 * @example Basic usage with default testnet
 * ```tsx
 * import { KleverProvider } from '@klever/connect-react'
 *
 * function App() {
 *   return (
 *     <KleverProvider>
 *       <YourApp />
 *     </KleverProvider>
 *   )
 * }
 * ```
 *
 * @example With mainnet and auto-connect
 * ```tsx
 * import { KleverProvider } from '@klever/connect-react'
 *
 * function App() {
 *   return (
 *     <KleverProvider config={{
 *       network: 'mainnet',
 *       autoConnect: true,
 *       debug: false
 *     }}>
 *       <YourApp />
 *     </KleverProvider>
 *   )
 * }
 * ```
 *
 * @example With custom network configuration
 * ```tsx
 * import { KleverProvider } from '@klever/connect-react'
 *
 * function App() {
 *   return (
 *     <KleverProvider config={{
 *       network: {
 *         name: 'custom',
 *         chainId: 108,
 *         api: 'https://api.custom-node.com',
 *         node: 'https://node.custom-node.com'
 *       }
 *     }}>
 *       <YourApp />
 *     </KleverProvider>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Network selection is persisted to localStorage and restored on reload
 * - Wallet connection state is managed automatically with event listeners
 * - Extension detection runs on mount to check for Klever Web Extension
 * - Provider instances are memoized to prevent unnecessary re-initializations
 * - Component handles cleanup of event listeners on unmount
 *
 * Configuration options:
 * - `network`: 'mainnet' | 'testnet' | 'devnet' | 'local' | Network object (default: 'testnet')
 * - `autoConnect`: Automatically connect wallet on mount (default: false)
 * - `reconnectOnMount`: Reconnect if previously connected (default: false)
 * - `provider`: Custom KleverProvider instance (overrides network config)
 * - `debug`: Enable debug logging (default: false)
 */
export function KleverProvider({ children, config }: KleverProviderProps): React.ReactElement {
  // Get saved network from localStorage or use config/default
  const getSavedNetwork = (): NetworkName | Network => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('klever-network')
      if (saved) {
        // Try to parse as NetworkName
        if (['mainnet', 'testnet', 'devnet', 'local'].includes(saved)) {
          return saved as NetworkName
        }
      }
    }
    return config?.network ?? 'testnet'
  }

  const savedNetwork = getSavedNetwork()

  // Memoize provider creation to prevent unnecessary reinitializations
  const createProviderWithNetwork = React.useCallback(
    (network: NetworkName | Network): KleverProviderClass => {
      const networkConfig = resolveNetwork(network)
      const providerConfig: { network: Network; debug?: boolean } = {
        network: networkConfig,
      }
      if (config?.debug !== undefined) {
        providerConfig.debug = config.debug
      }
      return new KleverProviderConstructor(providerConfig)
    },
    [config?.debug],
  )

  // Create initial provider only once (empty deps intentional - only create on mount)
  const initialProvider = React.useMemo(() => {
    return config?.provider ?? createProviderWithNetwork(savedNetwork)
  }, [])

  const [state, dispatch] = React.useReducer(kleverReducer, {
    provider: initialProvider,
    isConnected: false,
    isConnecting: false,
    searchingExtension: false,
    currentNetwork: getNetworkName(savedNetwork),
  })

  const connect = React.useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_CONNECTING', isConnecting: true })

    try {
      // Clean up existing wallet listeners if any
      if (state.wallet) {
        state.wallet.removeAllListeners('accountChanged')
        state.wallet.removeAllListeners('disconnect')
      }

      const factory = new WalletFactory(state.provider)
      const wallet = await factory.createWallet()
      await wallet.connect() // Connect the wallet after creation
      const address = wallet.address

      // Update extension provider to match current network if using BrowserWallet
      if (wallet instanceof BrowserWallet) {
        const networkConfig = getNetworkConfig(state.currentNetwork)
        wallet.updateProvider(networkConfig)
      }

      // Set up event listeners
      wallet.on('accountChanged', (data: unknown) => {
        const eventData = data as { address: string }
        const newAddress = eventData.address

        // Only update if address actually changed
        if (newAddress !== address) {
          // Validate address - KLV addresses should be 62 characters
          if (newAddress && newAddress.startsWith('klv') && newAddress.length === 62) {
            dispatch({ type: 'SET_WALLET', wallet, address: newAddress })
          } else {
            // Invalid address, disconnect
            dispatch({ type: 'DISCONNECT' })
          }
        }
      })

      wallet.on('disconnect', () => {
        dispatch({ type: 'DISCONNECT' })
      })

      dispatch({ type: 'SET_WALLET', wallet, address })

      // Store connection state
      if (typeof window !== 'undefined') {
        localStorage.setItem('klever-connected', 'true')
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error as Error })
    }
  }, [state.provider, state.wallet, state.currentNetwork])

  const disconnect = React.useCallback((): void => {
    // Remove event listeners from wallet before disconnecting
    if (state.wallet) {
      state.wallet.removeAllListeners('accountChanged')
      state.wallet.removeAllListeners('disconnect')
    }

    dispatch({ type: 'DISCONNECT' })

    // Clear connection state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('klever-connected')
    }
  }, [state.wallet])

  const switchNetwork = React.useCallback(
    async (newNetwork: NetworkName): Promise<void> => {
      try {
        // Check if network is actually changing
        if (state.currentNetwork === newNetwork) {
          return // No change needed
        }

        // Save network preference
        if (typeof window !== 'undefined') {
          localStorage.setItem('klever-network', newNetwork)
        }

        // Create new provider first to ensure it's ready
        const newProvider = createProviderWithNetwork(newNetwork)

        // Update extension provider if using BrowserWallet (before updating state)
        if (state.wallet && state.wallet instanceof BrowserWallet) {
          const networkConfig = getNetworkConfig(newNetwork)
          // Update the extension configuration (NetworkURI)
          state.wallet.updateProvider(networkConfig)
          // Update the wallet's internal provider (IProvider)
          state.wallet.updateProvider(newProvider)

          // Dispatch SET_WALLET to ensure React detects the wallet change
          // This is necessary because we mutated the wallet object
          dispatch({ type: 'SET_WALLET', wallet: state.wallet, address: state.address || '' })
        }

        // Update state atomically - network and provider together
        dispatch({ type: 'SET_NETWORK', network: newNetwork })
        dispatch({ type: 'SET_PROVIDER', provider: newProvider })

        // No need to disconnect/reconnect - the extension handles the network switch
        // The wallet instance stays connected but now uses the new network
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: error as Error })
        console.error('Switch network error:', error)
      }
    },
    [state.wallet, state.currentNetwork, state.address, createProviderWithNetwork],
  )

  // Check for extension on mount
  React.useEffect((): void => {
    const checkExtension = async (): Promise<void> => {
      dispatch({ type: 'SET_SEARCHING_EXTENSION', searching: true })

      try {
        // Check if window.kleverWeb exists (Klever extension)
        const hasExtension =
          typeof window !== 'undefined' && 'kleverWeb' in window && window.kleverWeb !== undefined

        dispatch({ type: 'SET_EXTENSION_INSTALLED', installed: hasExtension })
      } catch {
        dispatch({ type: 'SET_EXTENSION_INSTALLED', installed: false })
      } finally {
        dispatch({ type: 'SET_SEARCHING_EXTENSION', searching: false })
      }
    }

    void checkExtension()
  }, [])

  // Auto-connect on mount if configured
  const hasAutoConnectedRef = React.useRef(false)

  React.useEffect((): void => {
    if (hasAutoConnectedRef.current) return

    if (config?.autoConnect ?? config?.reconnectOnMount) {
      const wasConnected =
        typeof window !== 'undefined' && localStorage.getItem('klever-connected') === 'true'

      if (
        (config.autoConnect ?? (config.reconnectOnMount && wasConnected)) &&
        !state.isConnected &&
        !state.isConnecting
      ) {
        hasAutoConnectedRef.current = true
        void connect()
      }
    }
  }, [
    config?.autoConnect,
    config?.reconnectOnMount,
    state.isConnected,
    state.isConnecting,
    connect,
  ])

  // Cleanup event listeners on unmount
  React.useEffect(() => {
    return () => {
      if (state.wallet) {
        state.wallet.removeAllListeners('accountChanged')
        state.wallet.removeAllListeners('disconnect')
      }
    }
  }, [state.wallet])

  const value: KleverContextValue = {
    ...state,
    connect,
    disconnect,
    switchNetwork,
  }

  return <KleverContext.Provider value={value}>{children}</KleverContext.Provider>
}

/**
 * useKlever - Main hook for accessing Klever blockchain functionality
 *
 * Provides access to wallet connection, network management, and blockchain provider.
 * Must be used within a KleverProvider component tree.
 *
 * @returns KleverContextValue object with wallet state and control methods
 *
 * @throws Error if used outside of KleverProvider
 *
 * @example Basic wallet connection
 * ```tsx
 * import { useKlever } from '@klever/connect-react'
 *
 * function WalletButton() {
 *   const { connect, disconnect, isConnected, address } = useKlever()
 *
 *   return (
 *     <div>
 *       {!isConnected ? (
 *         <button onClick={connect}>Connect Wallet</button>
 *       ) : (
 *         <div>
 *           <p>Connected: {address}</p>
 *           <button onClick={disconnect}>Disconnect</button>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Network switching
 * ```tsx
 * import { useKlever } from '@klever/connect-react'
 *
 * function NetworkSelector() {
 *   const { currentNetwork, switchNetwork } = useKlever()
 *
 *   return (
 *     <select
 *       value={currentNetwork}
 *       onChange={(e) => switchNetwork(e.target.value as NetworkName)}
 *     >
 *       <option value="mainnet">Mainnet</option>
 *       <option value="testnet">Testnet</option>
 *       <option value="devnet">Devnet</option>
 *     </select>
 *   )
 * }
 * ```
 *
 * @example Checking extension availability
 * ```tsx
 * import { useKlever } from '@klever/connect-react'
 *
 * function ExtensionCheck() {
 *   const { extensionInstalled, searchingExtension } = useKlever()
 *
 *   if (searchingExtension) {
 *     return <p>Checking for Klever Extension...</p>
 *   }
 *
 *   if (!extensionInstalled) {
 *     return (
 *       <p>
 *         Please install{' '}
 *         <a href="https://klever.io/extension">Klever Extension</a>
 *       </p>
 *     )
 *   }
 *
 *   return <p>Extension detected!</p>
 * }
 * ```
 *
 * @remarks
 * Return value properties:
 *
 * **State:**
 * - `wallet`: Wallet instance (undefined if not connected)
 * - `provider`: KleverProvider instance for blockchain queries
 * - `address`: Connected wallet address (undefined if not connected)
 * - `isConnected`: Boolean indicating wallet connection status
 * - `isConnecting`: Boolean indicating connection in progress
 * - `error`: Error object if any operation failed (undefined otherwise)
 * - `extensionInstalled`: Boolean indicating if Klever Extension is installed
 * - `searchingExtension`: Boolean indicating if extension check is in progress
 * - `currentNetwork`: Current network name ('mainnet' | 'testnet' | 'devnet' | 'local')
 *
 * **Methods:**
 * - `connect()`: Async function to initiate wallet connection
 *   - Detects and connects to Klever Web Extension
 *   - Sets up event listeners for account changes and disconnection
 *   - Persists connection state to localStorage
 *   - Updates provider to match current network
 *
 * - `disconnect()`: Function to disconnect wallet
 *   - Removes all event listeners
 *   - Clears wallet state
 *   - Removes connection state from localStorage
 *
 * - `switchNetwork(network)`: Async function to switch networks
 *   - Changes blockchain network without disconnecting wallet
 *   - Updates provider instance
 *   - Updates extension provider if using BrowserWallet
 *   - Persists network selection to localStorage
 *   - Wallet remains connected during network switch
 *
 * **React Considerations:**
 * - Hook follows React hooks rules (use only in function components or custom hooks)
 * - Context updates trigger re-renders in consuming components
 * - Connection/disconnection methods are stable (wrapped in useCallback)
 * - Event listeners are automatically cleaned up on unmount
 * - State changes are batched using useReducer for optimal performance
 */
export function useKlever(): KleverContextValue {
  const context = React.useContext(KleverContext)
  if (!context) {
    throw new Error('useKlever must be used within a KleverProvider')
  }
  return context
}
