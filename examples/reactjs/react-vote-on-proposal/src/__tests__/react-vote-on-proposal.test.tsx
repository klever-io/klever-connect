import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendTransaction = vi.fn(async () => ({ hash: 'mock_vote_tx', status: 'pending' }))
const providerCall = vi.fn(async () => ({
  proposal: { proposalId: 5, description: 'Reduce inflation rate', status: 'Active' },
}))

const klever = {
  isConnected: true,
  address: 'klv1voter',
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

describe('react-vote-on-proposal', () => {
  beforeEach(() => {
    sendTransaction.mockClear()
    providerCall.mockClear()
  })

  it('fetches proposal metadata when id is set', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('proposal-id'), '5')
    await waitFor(() => expect(providerCall).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('proposal-card').textContent).toContain('Reduce inflation')
    )
  })

  it('sends a Vote tx with type=0 for Yes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('proposal-id'), '5')
    await user.click(screen.getByTestId('vote-yes'))
    expect(sendTransaction).toHaveBeenCalledTimes(1)
    const call = sendTransaction.mock.calls[0][0]
    expect(call.contractType).toBe(14)
    expect(call.payload).toEqual({ proposalId: 5, type: 0, amount: '1000000' })
  })

  it('sends type=1 for No', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('proposal-id'), '5')
    await user.click(screen.getByTestId('vote-no'))
    expect(sendTransaction.mock.calls[0][0].payload.type).toBe(1)
  })
})
