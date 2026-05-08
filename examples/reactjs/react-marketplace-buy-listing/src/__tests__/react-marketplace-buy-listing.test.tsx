import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendTransaction = vi.fn(async () => ({ hash: 'mock_buy_tx', status: 'pending' }))
const providerCall = vi.fn(async () => ({
  listings: [
    { orderId: '1', asset: 'NFT/01', price: '1000000', currency: 'KLV', seller: 'klv1seller' },
    { orderId: '2', asset: 'KFI', price: '5000000', currency: 'KLV', seller: 'klv1other' },
  ],
}))

const klever = {
  isConnected: true,
  address: 'klv1buyer',
  connect: vi.fn(),
  disconnect: vi.fn(),
  extensionInstalled: true,
  provider: { call: providerCall },
}

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => klever,
    useTransaction: () => ({
      sendTransaction,
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const { App } = await import('../App')

describe('react-marketplace-buy-listing (polished)', () => {
  beforeEach(() => {
    sendTransaction.mockClear()
    providerCall.mockClear()
  })

  it('fetches and renders listings', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('marketplace-id'), '1')
    await waitFor(() => expect(providerCall).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByTestId('listing-1')).toBeInTheDocument())
    expect(screen.getByTestId('listing-2')).toBeInTheDocument()
  })

  it('buys a listing with the correct payload', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('marketplace-id'), '1')
    await waitFor(() => expect(screen.getByTestId('buy-1')).toBeInTheDocument())
    await user.click(screen.getByTestId('buy-1'))
    expect(sendTransaction).toHaveBeenCalledTimes(1)
    expect(sendTransaction.mock.calls[0][0]).toEqual({
      contractType: 17,
      payload: { buyType: 0, id: '1', currencyId: 'KLV', amount: '1000000' },
    })
  })
})
