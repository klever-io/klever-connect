// =============================================================================
// react-provider-setup.test.tsx — mocked-provider unit test.
// =============================================================================
// Strategy:
//   The real <KleverProvider> reaches for `window.kleverWeb` and starts a
//   detection backoff loop on mount. In jsdom that loop never resolves, so
//   instead we stub `useKlever()` via vitest's `vi.mock`. We assert the three
//   data points the App renders: network, extension status, wallet status —
//   proving useKlever() is correctly wired.
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MockWallet, createMockProvider } from '../../../../_shared/mock-wallet/src'
import type { Wallet } from '@klever/connect'

// Hoisted mock — vitest replaces useKlever before any module imports the App.
const mockState: {
  wallet: Wallet | undefined
  isConnected: boolean
  extensionInstalled: boolean
  searchingExtension: boolean
  currentNetwork: 'testnet' | 'mainnet' | 'devnet' | 'local'
  address: string | undefined
} = {
  wallet: undefined,
  isConnected: false,
  extensionInstalled: false,
  searchingExtension: false,
  currentNetwork: 'testnet',
  address: undefined,
}

vi.mock('@klever/connect-react', async (importOriginal) => {
  const real = await importOriginal<typeof import('@klever/connect-react')>()
  return {
    ...real,
    useKlever: () => ({
      wallet: mockState.wallet,
      provider: createMockProvider(),
      address: mockState.address,
      isConnected: mockState.isConnected,
      isConnecting: false,
      extensionInstalled: mockState.extensionInstalled,
      searchingExtension: mockState.searchingExtension,
      currentNetwork: mockState.currentNetwork,
      connect: vi.fn(async () => undefined),
      disconnect: vi.fn(() => undefined),
      switchNetwork: vi.fn(async () => undefined),
    }),
  }
})

// IMPORTANT: import App AFTER vi.mock declares its replacement.
import { App } from '../App'

describe('react-provider-setup', () => {
  it('renders network, "extension not installed" and "not connected" by default', () => {
    mockState.wallet = undefined
    mockState.isConnected = false
    mockState.extensionInstalled = false
    mockState.searchingExtension = false
    mockState.currentNetwork = 'testnet'
    mockState.address = undefined

    render(<App />)

    expect(screen.getByTestId('network')).toHaveTextContent('testnet')
    expect(screen.getByTestId('extension-status')).toHaveTextContent(/not installed/i)
    expect(screen.getByTestId('wallet-status')).toHaveTextContent(/not connected/i)
  })

  it('shows "Connected as <address>" when a MockWallet is in context', () => {
    const wallet = new MockWallet({
      address: 'klv1examplemock0000000000000000000000000000000abcd',
    })
    mockState.wallet = wallet as unknown as Wallet
    mockState.isConnected = true
    mockState.extensionInstalled = true
    mockState.searchingExtension = false
    mockState.currentNetwork = 'mainnet'
    mockState.address = wallet.address

    render(<App />)

    expect(screen.getByTestId('network')).toHaveTextContent('mainnet')
    expect(screen.getByTestId('extension-status')).toHaveTextContent(/installed/i)
    expect(screen.getByTestId('wallet-status')).toHaveTextContent(/connected as klv1examplemock/i)
  })
})
