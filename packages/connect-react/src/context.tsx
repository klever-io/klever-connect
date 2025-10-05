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
          // Update the provider object directly on the extension
          state.wallet.updateProvider(networkConfig)
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
    [state.wallet, state.currentNetwork, createProviderWithNetwork],
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

export function useKlever(): KleverContextValue {
  const context = React.useContext(KleverContext)
  if (!context) {
    throw new Error('useKlever must be used within a KleverProvider')
  }
  return context
}
