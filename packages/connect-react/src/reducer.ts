import type { Wallet } from '@klever/connect-wallet'
import { getNetworkName } from '@klever/connect-provider'
import type { KleverProvider, Network, NetworkName } from '@klever/connect-provider'
import type { KleverState } from './types'

export type KleverAction =
  | { type: 'SET_WALLET'; wallet: Wallet; address: string }
  | { type: 'SET_CONNECTING'; isConnecting: boolean }
  | { type: 'SET_ERROR'; error: Error }
  | { type: 'DISCONNECT' }
  | { type: 'RESET_ERROR' }
  | { type: 'SET_EXTENSION_INSTALLED'; installed: boolean }
  | { type: 'SET_SEARCHING_EXTENSION'; searching: boolean }
  | { type: 'SET_NETWORK'; network: NetworkName | Network }
  | { type: 'SET_PROVIDER'; provider: KleverProvider }

export function kleverReducer(state: KleverState, action: KleverAction): KleverState {
  switch (action.type) {
    case 'SET_WALLET':
      return {
        ...state,
        wallet: action.wallet,
        address: action.address,
        isConnected: true,
        isConnecting: false,
      }
    case 'SET_CONNECTING':
      return {
        ...state,
        isConnecting: action.isConnecting,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isConnecting: false,
      }
    case 'DISCONNECT': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { wallet, address, ...stateWithoutWallet } = state
      return {
        ...stateWithoutWallet,
        isConnected: false,
        isConnecting: false,
      }
    }
    case 'RESET_ERROR': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { error, ...stateWithoutError } = state
      return stateWithoutError
    }
    case 'SET_EXTENSION_INSTALLED':
      return {
        ...state,
        extensionInstalled: action.installed,
      }
    case 'SET_SEARCHING_EXTENSION':
      return {
        ...state,
        searchingExtension: action.searching,
      }
    case 'SET_NETWORK':
      return {
        ...state,
        currentNetwork: getNetworkName(action.network),
      }
    case 'SET_PROVIDER':
      return {
        ...state,
        provider: action.provider,
      }
    default:
      return state
  }
}
