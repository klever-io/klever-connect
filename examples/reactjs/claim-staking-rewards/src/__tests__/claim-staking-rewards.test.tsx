import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const claim = vi.fn(async () => ({
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
      claim,
      withdraw: vi.fn(),
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('claim-staking-rewards', () => {
  it('claims (0, "KLV") by default', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(claim).toHaveBeenCalledWith(0, 'KLV'))
  })

  it('claims FPR rewards on a custom KDA when selected', async () => {
    claim.mockClear()
    render(<App />)
    fireEvent.change(screen.getByTestId('claim-type-select'), { target: { value: '3' } })
    fireEvent.change(screen.getByTestId('asset-input'), { target: { value: 'MTT-ABCD-1A' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(claim).toHaveBeenCalledWith(3, 'MTT-ABCD-1A'))
  })
})
