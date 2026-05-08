// =============================================================================
// react-wallet-connect-disconnect.test.tsx — mocked-provider unit tests.
// =============================================================================
// We stub `useKlever()` via vi.mock so the App is exercised without a real
// extension or network.
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Wallet } from '@klever/connect'
import { MockWallet, createMockProvider } from '../../../../_shared/mock-wallet/src'

const connectFn = vi.fn(async () => undefined)
const disconnectFn = vi.fn(() => undefined)

const state: {
  wallet: Wallet | undefined
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  extensionInstalled: boolean
  searchingExtension: boolean
  error: Error | undefined
} = {
  wallet: undefined,
  address: undefined,
  isConnected: false,
  isConnecting: false,
  extensionInstalled: true,
  searchingExtension: false,
  error: undefined,
}

vi.mock('@klever/connect-react', async (orig) => {
  const real = await orig<typeof import('@klever/connect-react')>()
  return {
    ...real,
    useKlever: () => ({
      wallet: state.wallet,
      provider: createMockProvider(),
      address: state.address,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      extensionInstalled: state.extensionInstalled,
      searchingExtension: state.searchingExtension,
      currentNetwork: 'testnet' as const,
      error: state.error,
      connect: connectFn,
      disconnect: disconnectFn,
      switchNetwork: vi.fn(async () => undefined),
    }),
  }
})

import { App } from '../App'

describe('react-wallet-connect-disconnect', () => {
  it('shows the install banner when the extension is not present', () => {
    Object.assign(state, {
      extensionInstalled: false,
      searchingExtension: false,
      isConnected: false,
      address: undefined,
      wallet: undefined,
      error: undefined,
    })

    render(<App />)

    expect(screen.getByTestId('no-extension')).toBeInTheDocument()
    expect(screen.queryByTestId('connect-btn')).not.toBeInTheDocument()
  })

  it('shows a "detecting" status while searching for the extension', () => {
    Object.assign(state, { searchingExtension: true, extensionInstalled: false })
    render(<App />)
    expect(screen.getByTestId('searching')).toHaveTextContent(/detecting/i)
  })

  it('shows Connect button when extension installed but no wallet connected', () => {
    Object.assign(state, {
      extensionInstalled: true,
      searchingExtension: false,
      isConnected: false,
      address: undefined,
      wallet: undefined,
    })

    render(<App />)
    const btn = screen.getByTestId('connect-btn')
    expect(btn).toBeEnabled()

    fireEvent.click(btn)
    expect(connectFn).toHaveBeenCalledTimes(1)
  })

  it('shows the connected address and a Disconnect button when isConnected', () => {
    const wallet = new MockWallet({ address: 'klv1examplemock0000000000000000000000abcd' })
    Object.assign(state, {
      extensionInstalled: true,
      searchingExtension: false,
      isConnected: true,
      address: wallet.address,
      wallet: wallet as unknown as Wallet,
    })

    render(<App />)
    expect(screen.getByTestId('address')).toHaveTextContent(wallet.address)

    const btn = screen.getByTestId('disconnect-btn')
    fireEvent.click(btn)
    expect(disconnectFn).toHaveBeenCalled()
  })

  it('renders an error message when connect() fails', () => {
    Object.assign(state, {
      extensionInstalled: true,
      searchingExtension: false,
      isConnected: false,
      error: new Error('User rejected'),
    })

    render(<App />)
    expect(screen.getByTestId('error')).toHaveTextContent('User rejected')
  })
})
