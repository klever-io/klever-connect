// Tests for sc-invoke-mutable: replace useKlever and Contract so we can
// drive the form without the extension or a real chain.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockWallet } from './mock-wallet'

const wallet = new MockWallet('klv1user')
const klever = {
  wallet,
  isConnected: true,
  address: 'klv1user',
  connect: vi.fn(),
  disconnect: vi.fn(),
  extensionInstalled: true,
}
const invoke = vi.fn(async () => ({ hash: 'mock_tx_sc' }))

class FakeContract {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(
    public address: string,
    public abi: unknown,
    public signer: unknown,
  ) {}
  invoke = invoke
  call = vi.fn()
}

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => klever,
    Contract: FakeContract,
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const { App } = await import('../App')
const VALID_CONTRACT = 'klv1qqqqqqqqqqqqqpgqpg2ff85tljne96d2jwedj4mkrhsu3up5c0nq0x8g69'

describe('sc-invoke-mutable', () => {
  beforeEach(() => invoke.mockClear())

  it('rejects an EOA address', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), 'klv1notacontract')
    expect(screen.getByTestId('validation').textContent).toMatch(/contract/i)
  })

  it('calls increment() on the FakeContract', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), VALID_CONTRACT)
    await user.click(screen.getByTestId('increment'))
    expect(invoke).toHaveBeenCalledWith('increment')
  })

  it('calls add(value)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), VALID_CONTRACT)
    await user.clear(screen.getByTestId('add-value'))
    await user.type(screen.getByTestId('add-value'), '7')
    await user.click(screen.getByTestId('add'))
    expect(invoke).toHaveBeenCalledWith('add', 7)
    expect(await screen.findByTestId('success')).toBeInTheDocument()
  })
})
