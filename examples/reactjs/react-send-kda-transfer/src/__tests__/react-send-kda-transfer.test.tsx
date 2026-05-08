import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const sendKDA = vi.fn(async () => ({ hash: 'mock_kda_tx', status: 'pending' }))
const getAccount = vi.fn(async () => ({
  assets: {
    KFI: { balance: '100000000', precision: 6 },
    'NFT/01': { balance: '1', precision: 0 },
  },
}))
const klever = {
  isConnected: true,
  address: 'klv1user',
  connect: vi.fn(),
  disconnect: vi.fn(),
  extensionInstalled: true,
  provider: { getAccount },
}

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => klever,
    useTransaction: () => ({
      sendKDA,
      sendKLV: vi.fn(),
      sendTransaction: vi.fn(),
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const VALID = 'klv1usdnywjhrlv4tcyu6stxpl6yvhplg35nepljlt4y5r7yppe8er4qujlazy'
const { App } = await import('../App')

describe('react-send-kda-transfer', () => {
  beforeEach(() => {
    sendKDA.mockClear()
    getAccount.mockClear()
  })

  it('fetches holdings and populates the picker', async () => {
    render(<App />)
    await waitFor(() => expect(getAccount).toHaveBeenCalled())
    expect(screen.getByTestId('kda-select')).toBeInTheDocument()
    const options = screen.getByTestId('kda-select').querySelectorAll('option')
    expect(Array.from(options).some((o) => o.textContent?.includes('KFI'))).toBe(true)
  })

  it('uses parseUnits with the correct per-asset precision', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(getAccount).toHaveBeenCalled())
    await user.selectOptions(screen.getByTestId('kda-select'), 'KFI')
    await user.type(screen.getByTestId('to'), VALID)
    await user.type(screen.getByTestId('amount'), '5')
    await user.click(screen.getByTestId('send'))
    expect(sendKDA).toHaveBeenCalledWith({
      to: VALID,
      amount: 5_000_000n,
      kda: 'KFI',
    })
  })

  it('rejects amounts above balance', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(getAccount).toHaveBeenCalled())
    await user.selectOptions(screen.getByTestId('kda-select'), 'KFI')
    await user.type(screen.getByTestId('to'), VALID)
    await user.type(screen.getByTestId('amount'), '999999')
    expect(screen.getByTestId('validation').textContent).toMatch(/exceeds balance/)
  })
})
