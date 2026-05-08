import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const withdraw = vi.fn(async () => ({
  hash: 'mock-hash',
  status: 'success' as const,
  transaction: undefined as never,
  wait: async () => ({}),
}))

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
    useStaking: () => ({
      freeze: vi.fn(),
      unfreeze: vi.fn(),
      delegate: vi.fn(),
      undelegate: vi.fn(),
      claim: vi.fn(),
      withdraw,
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('withdraw-after-cooldown', () => {
  it('calls withdraw(0, { kda: "KLV" }) by default', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(withdraw).toHaveBeenCalledWith(0, { kda: 'KLV' }))
  })

  it('passes withdrawType 1 and a custom KDA when selected', async () => {
    withdraw.mockClear()
    render(<App />)
    fireEvent.change(screen.getByTestId('type-select'), { target: { value: '1' } })
    fireEvent.change(screen.getByTestId('kda-input'), { target: { value: 'MTT-ABCD-1A' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(withdraw).toHaveBeenCalledWith(1, { kda: 'MTT-ABCD-1A' }))
  })
})
