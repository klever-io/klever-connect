// Mocked-default test for `marketplace-list-asset` (React).
// Replaces useKlever + useTransaction so we can drive the form without a wallet.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendTransaction = vi.fn(async () => ({ hash: 'mock_tx', status: 'pending' }))
const txState = { isLoading: false, error: null as Error | null, data: null as { hash: string } | null }
const klever = {
  isConnected: true,
  address: 'klv1seller',
  connect: vi.fn(),
  disconnect: vi.fn(),
  extensionInstalled: true,
}

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => klever,
    useTransaction: () => ({ sendTransaction, ...txState, reset: vi.fn() }),
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const { App } = await import('../App')

describe('marketplace-list-asset', () => {
  beforeEach(() => {
    sendTransaction.mockClear()
    txState.isLoading = false
    txState.error = null
    txState.data = null
  })

  it('blocks submit until all fields are valid', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('list')).toBeDisabled()
    await user.type(screen.getByTestId('asset-id'), 'KFI')
    await user.type(screen.getByTestId('marketplace-id'), '1')
    expect(screen.getByTestId('list')).toBeEnabled()
  })

  it('sends a Sell tx with the correct payload', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('asset-id'), 'KFI')
    await user.type(screen.getByTestId('marketplace-id'), '1')
    await user.clear(screen.getByTestId('price'))
    await user.type(screen.getByTestId('price'), '5')
    await user.click(screen.getByTestId('list'))
    expect(sendTransaction).toHaveBeenCalledTimes(1)
    const call = sendTransaction.mock.calls[0][0]
    // contractType 18 = Sell.
    expect(call.contractType).toBe(18)
    expect(call.payload).toMatchObject({
      assetId: 'KFI',
      marketplaceId: '1',
      currencyId: 'KLV',
      price: '5000000', // 5 KLV in 6-decimal smallest-units.
      marketType: 0,
    })
    expect(call.payload.endTime).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })
})
