import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendTransaction = vi.fn(async () => ({ hash: 'mock_tx', status: 'pending' }))
const klever = {
  isConnected: true,
  address: 'klv1user',
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

describe('ito-buy-from-ito', () => {
  beforeEach(() => sendTransaction.mockClear())

  it('builds a Buy tx with buyType=1 (ITO)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('kda'), 'MYTOKEN-A1B2')
    await user.clear(screen.getByTestId('spend'))
    await user.type(screen.getByTestId('spend'), '10')
    await user.click(screen.getByTestId('buy'))
    expect(sendTransaction).toHaveBeenCalledTimes(1)
    const call = sendTransaction.mock.calls[0][0]
    expect(call.contractType).toBe(17)
    expect(call.payload.buyType).toBe(1)
    expect(call.payload.id).toBe('MYTOKEN-A1B2')
    expect(call.payload.amount).toBe('10000000')
  })
})
