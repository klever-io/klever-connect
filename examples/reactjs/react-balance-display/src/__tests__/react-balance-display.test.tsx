// =============================================================================
// react-balance-display.test.tsx
// =============================================================================
// We mock both `useKlever` (so the App thinks the wallet is connected) and
// `useBalance` (so we control the values rendered without hitting any RPC).
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const refetchKlv = vi.fn()
const refetchKda = vi.fn()

const klvBalance = {
  token: 'KLV',
  amount: 250_000_000n,
  precision: 6,
  formatted: '250',
}

const kdaBalance = {
  token: 'KFI',
  amount: 12_500_000n,
  precision: 6,
  formatted: '12.5',
}

const klvState = { balance: klvBalance as typeof klvBalance | null, isLoading: false, error: null as Error | null }
const kdaState = { balance: kdaBalance as typeof kdaBalance | null, isLoading: false, error: null as Error | null }

vi.mock('@klever/connect-react', async (orig) => {
  const real = await orig<typeof import('@klever/connect-react')>()
  return {
    ...real,
    useKlever: () => ({
      wallet: undefined,
      provider: {} as never,
      address: 'klv1mockwallet000000000000000000000000000000abcd',
      isConnected: true,
      isConnecting: false,
      extensionInstalled: true,
      searchingExtension: false,
      currentNetwork: 'testnet' as const,
      error: undefined,
      connect: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
    }),
    useBalance: (token: string) => {
      if (token === 'KLV') return { ...klvState, refetch: refetchKlv }
      return { ...kdaState, refetch: refetchKda }
    },
  }
})

import { App } from '../App'

describe('react-balance-display', () => {
  it('renders KLV and KDA balance cards with formatted amounts', () => {
    render(<App />)
    expect(screen.getByTestId('amount-KLV')).toHaveTextContent('250')
    expect(screen.getByTestId('amount-KFI')).toHaveTextContent('12.5')
  })

  it('calls refetch when the per-card refresh button is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('refresh-KLV'))
    fireEvent.click(screen.getByTestId('refresh-KFI'))
    expect(refetchKlv).toHaveBeenCalled()
    expect(refetchKda).toHaveBeenCalled()
  })

  it('renders an error line if useBalance returns an error', () => {
    klvState.error = new Error('rpc unreachable')
    render(<App />)
    expect(screen.getByTestId('error-KLV')).toHaveTextContent('rpc unreachable')
    klvState.error = null
  })
})
