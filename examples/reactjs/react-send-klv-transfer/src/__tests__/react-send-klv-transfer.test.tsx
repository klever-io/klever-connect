import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendKLV = vi.fn(async () => ({ hash: 'mock_klv_tx', status: 'pending' }))
const txState = {
  isLoading: false,
  error: null as Error | null,
  data: null as { hash: string } | null,
}
const klever = {
  isConnected: true,
  address: 'klv1sender',
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
      sendKLV,
      sendKDA: vi.fn(),
      sendTransaction: vi.fn(),
      ...txState,
      reset: vi.fn(() => {
        txState.data = null
        txState.error = null
      }),
    }),
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const VALID = 'klv1usdnywjhrlv4tcyu6stxpl6yvhplg35nepljlt4y5r7yppe8er4qujlazy'
const { App } = await import('../App')

describe('react-send-klv-transfer', () => {
  beforeEach(() => {
    sendKLV.mockClear()
    txState.isLoading = false
    txState.error = null
    txState.data = null
  })

  it('blocks send until both fields validate', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('send')).toBeDisabled()
    await user.type(screen.getByTestId('to'), VALID)
    await user.type(screen.getByTestId('amount'), '1.5')
    expect(screen.getByTestId('send')).toBeEnabled()
    expect(screen.getByTestId('preview').textContent).toContain('1.5')
  })

  it('rejects bad addresses inline', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('to'), 'klv1nonsense')
    expect(screen.getByTestId('to-error')).toBeInTheDocument()
  })

  it('calls sendKLV with the parsed bigint amount', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('to'), VALID)
    await user.type(screen.getByTestId('amount'), '2')
    await user.click(screen.getByTestId('send'))
    expect(sendKLV).toHaveBeenCalledTimes(1)
    expect(sendKLV.mock.calls[0][0]).toEqual({ to: VALID, amount: 2_000_000n })
  })
})
