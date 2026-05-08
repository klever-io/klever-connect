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

describe('kda-mint', () => {
  it('builds an AssetTrigger / triggerType=0 with parseUnits-amount', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('kda-input'), { target: { value: 'MTT-ABCD-1A' } })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '500' } })
    fireEvent.change(screen.getByTestId('precision-input'), { target: { value: '6' } })
    fireEvent.click(screen.getByTestId('submit-btn'))

    await waitFor(() => expect(sendTransaction).toHaveBeenCalled())
    const arg = sendTransaction.mock.calls[0][0]
    expect(arg.triggerType).toBe(0)
    expect(arg.assetId).toBe('MTT-ABCD-1A')
    expect(arg.amount).toBe(500_000_000n)
    expect(arg.receiver).toBe('klv1mockwallet000000000000000000000000000000abcd')
  })

  it('disables submit when KDA is blank', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('kda-input'), { target: { value: '' } })
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })
})
