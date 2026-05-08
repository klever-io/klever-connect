import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const sendTransaction = vi.fn()

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
    useTransaction: () => ({
      sendKLV: vi.fn(),
      sendKDA: vi.fn(),
      sendTransaction,
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('governance-vote', () => {
  it('builds Vote contract with type=0 when YES is clicked', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('proposal-input'), { target: { value: '7' } })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '50' } })
    fireEvent.click(screen.getByTestId('vote-yes'))

    await waitFor(() => expect(sendTransaction).toHaveBeenCalled())
    const arg = sendTransaction.mock.calls[0][0]
    expect(arg.proposalId).toBe(7)
    expect(arg.amount).toBe(50_000_000n) // parseUnits('50', 6)
    expect(arg.type).toBe(0) // Yes
  })

  it('builds Vote with type=1 when NO is clicked', async () => {
    sendTransaction.mockClear()
    render(<App />)
    fireEvent.change(screen.getByTestId('proposal-input'), { target: { value: '12' } })
    fireEvent.click(screen.getByTestId('vote-no'))

    await waitFor(() => expect(sendTransaction).toHaveBeenCalled())
    const arg = sendTransaction.mock.calls[0][0]
    expect(arg.proposalId).toBe(12)
    expect(arg.type).toBe(1) // No
  })
})
