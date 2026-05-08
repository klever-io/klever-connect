import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const klever = {
  isConnected: false,
  address: undefined,
  connect: vi.fn(),
  disconnect: vi.fn(),
  provider: {},
}

const call = vi.fn(async () => [42])
class FakeContract {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(public address: string, public abi: unknown, public signer: unknown) {}
  call = call
  invoke = vi.fn()
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

const VALID_CONTRACT = 'klv1qqqqqqqqqqqqqpgqd2qf25aljkylzhyhz4qcnymd2nz4mvgcyqjms65czav'
const { App } = await import('../App')

describe('react-sc-readonly-query', () => {
  beforeEach(() => call.mockClear())

  it('rejects an EOA address', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), 'klv1notacontract')
    await user.click(screen.getByTestId('fetch'))
    expect(screen.getByTestId('error').textContent).toMatch(/contract/i)
  })

  it('renders the decoded result', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('contract-address'), VALID_CONTRACT)
    await user.click(screen.getByTestId('fetch'))
    expect(call).toHaveBeenCalledWith('get_value')
    expect((await screen.findByTestId('value')).textContent).toBe('42')
  })
})
