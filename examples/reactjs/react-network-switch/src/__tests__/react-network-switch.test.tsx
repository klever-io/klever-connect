// =============================================================================
// react-network-switch.test.tsx — vi.mock based unit test
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { NetworkName, IProvider } from '@klever/connect'

const switchNetworkFn = vi.fn(async () => undefined)

const state: { currentNetwork: NetworkName; provider: IProvider } = {
  currentNetwork: 'testnet',
  provider: {
    getBlockNumber: async () => 4242,
  } as unknown as IProvider,
}

vi.mock('@klever/connect-react', async (orig) => {
  const real = await orig<typeof import('@klever/connect-react')>()
  return {
    ...real,
    useKlever: () => ({
      wallet: undefined,
      provider: state.provider,
      address: undefined,
      isConnected: false,
      isConnecting: false,
      extensionInstalled: true,
      searchingExtension: false,
      currentNetwork: state.currentNetwork,
      error: undefined,
      connect: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: switchNetworkFn,
    }),
  }
})

import { App } from '../App'

describe('react-network-switch', () => {
  it('renders the current-network badge and the four switch options', async () => {
    state.currentNetwork = 'testnet'
    render(<App />)
    expect(screen.getByTestId('current-network')).toHaveTextContent('testnet')

    const select = screen.getByTestId('network-select') as HTMLSelectElement
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.value)
    expect(options).toEqual(['mainnet', 'testnet', 'devnet', 'local'])

    await waitFor(() =>
      expect(screen.getByTestId('block-readout')).toHaveTextContent('4242'),
    )
  })

  it('calls switchNetwork() with the new value when the select changes', () => {
    state.currentNetwork = 'testnet'
    render(<App />)
    fireEvent.change(screen.getByTestId('network-select'), { target: { value: 'devnet' } })
    expect(switchNetworkFn).toHaveBeenCalledWith('devnet')
  })

  it('shows an RPC error when getBlockNumber rejects', async () => {
    state.provider = {
      getBlockNumber: async () => {
        throw new Error('node down')
      },
    } as unknown as IProvider
    render(<App />)
    await waitFor(() =>
      expect(screen.getByTestId('block-readout')).toHaveTextContent('node down'),
    )
  })
})
