import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const sendKDA = vi.fn()
const txState = {
  isLoading: false,
  error: null as Error | null,
  data: null as { hash: string } | null,
}

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
      sendKDA,
      sendTransaction: vi.fn(),
      isLoading: txState.isLoading,
      error: txState.error,
      data: txState.data,
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('send-kda-transfer', () => {
  it('passes (to, parseUnits(amount, precision), kda) to sendKDA', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('to-input'), {
      target: { value: 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z' },
    })
    fireEvent.change(screen.getByTestId('kda-input'), { target: { value: 'MTT-ABCD-1A' } })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } })
    fireEvent.change(screen.getByTestId('precision-input'), { target: { value: '8' } })

    fireEvent.click(screen.getByTestId('submit-btn'))

    await waitFor(() => expect(sendKDA).toHaveBeenCalled())
    const [to, amount, kda] = sendKDA.mock.calls[0]
    expect(to).toBe('klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z')
    expect(amount).toBe(1_000_000_000n) // parseUnits('10', 8) = 10 * 10^8
    expect(kda).toBe('MTT-ABCD-1A')
  })

  it('disables submit when address is invalid', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('to-input'), { target: { value: 'bad' } })
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })
})
