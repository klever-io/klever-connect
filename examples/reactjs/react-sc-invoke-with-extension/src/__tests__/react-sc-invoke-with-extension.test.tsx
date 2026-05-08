import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

const invoke = vi.fn(async () => ({ hash: 'mock_tx_abi' }))
class FakeContract {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(public address: string, public abi: unknown, public signer: unknown) {}
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

// Stub global fetch for the ABI load.
const fakeAbi = {
  name: 'counter',
  endpoints: [
    { name: 'increment', mutability: 'mutable', inputs: [], outputs: [] },
    { name: 'add', mutability: 'mutable', inputs: [{ name: 'value', type: 'u32' }], outputs: [] },
    { name: 'get_value', mutability: 'readonly', inputs: [], outputs: [{ type: 'u32' }] },
  ],
}
beforeEach(() => {
  invoke.mockClear()
  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => fakeAbi,
  })) as unknown as typeof fetch
})

const VALID_CONTRACT = 'klv1qqqqqqqqqqqqqpgqd2qf25aljkylzhyhz4qcnymd2nz4mvgcyqjms65czav'
const { App } = await import('../App')

describe('react-sc-invoke-with-extension', () => {
  it('loads the ABI and lists mutable endpoints', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('abi-ok')).toBeInTheDocument())
    const select = screen.getByTestId('endpoint-select') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toContain('increment')
    expect(options).toContain('add')
    // readonly endpoints excluded.
    expect(options).not.toContain('get_value')
  })

  it('coerces u32 args to Number', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('abi-ok')).toBeInTheDocument())
    await user.type(screen.getByTestId('contract-address'), VALID_CONTRACT)
    await user.selectOptions(screen.getByTestId('endpoint-select'), 'add')
    await user.type(screen.getByTestId('arg-value'), '10')
    await user.click(screen.getByTestId('invoke'))
    expect(invoke).toHaveBeenCalledWith('add', 10)
  })

  it('shows abi-error if the fetch fails', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    })) as unknown as typeof fetch
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('abi-error')).toBeInTheDocument())
  })
})
