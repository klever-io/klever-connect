import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendTransaction = vi.fn(async () => ({ hash: 'mock_tx', status: 'pending' }))
const klever = {
  isConnected: true,
  address: 'klv1buyer',
  connect: vi.fn(),
  disconnect: vi.fn(),
  extensionInstalled: true,
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

describe('marketplace-buy-listing', () => {
  beforeEach(() => sendTransaction.mockClear())

  it('blocks submit until order id is set', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('buy')).toBeDisabled()
    await user.type(screen.getByTestId('order-id'), '7')
    expect(screen.getByTestId('buy')).toBeEnabled()
  })

  it('sends a Buy contract with marketBuy buyType', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('order-id'), 'order-7')
    await user.clear(screen.getByTestId('price'))
    await user.type(screen.getByTestId('price'), '2.5')
    await user.click(screen.getByTestId('buy'))
    expect(sendTransaction).toHaveBeenCalledTimes(1)
    const call = sendTransaction.mock.calls[0][0]
    expect(call.contractType).toBe(17)
    expect(call.payload).toEqual({
      buyType: 0,
      id: 'order-7',
      currencyId: 'KLV',
      amount: '2500000',
    })
  })
})
