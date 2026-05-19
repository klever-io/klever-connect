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
const invoke = vi.fn(async () => ({ hash: 'mock_tx_payable' }))

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

describe('sc-invoke-payable-with-klv', () => {
  beforeEach(() => invoke.mockClear())

  it('attaches { value: { KLV: <bigint> } } when invoking', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), VALID_CONTRACT)
    await user.clear(screen.getByTestId('value'))
    await user.type(screen.getByTestId('value'), '2.5')
    await user.click(screen.getByTestId('invoke'))
    expect(invoke).toHaveBeenCalledWith('deposit_and_increment', {
      value: { KLV: 2500000n },
    })
  })

  it('rejects zero KLV', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), VALID_CONTRACT)
    await user.clear(screen.getByTestId('value'))
    await user.type(screen.getByTestId('value'), '0')
    expect(screen.getByTestId('validation').textContent).toMatch(/> 0/)
    expect(screen.getByTestId('invoke')).toBeDisabled()
  })
})
