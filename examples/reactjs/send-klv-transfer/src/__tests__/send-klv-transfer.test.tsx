// =============================================================================
// send-klv-transfer.test.tsx
// =============================================================================
// Stubs useKlever() (connected) and useTransaction() (sendKLV captured by spy).
// Asserts:
//   - the form rejects an invalid recipient,
//   - submitting calls sendKLV(to, parseKLV(amount)),
//   - success state renders the hash.
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const sendKLV = vi.fn()
const reset = vi.fn()
const txState: { isLoading: boolean; error: Error | null; data: { hash: string } | null } = {
  isLoading: false,
  error: null,
  data: null,
}

vi.mock('@klever/connect-react', async (orig) => {
  const real = await orig<typeof import('@klever/connect-react')>()
  return {
    ...real,
    useKlever: () => ({
      wallet: undefined,
      provider: {} as never,
      address: 'klv1mockwallet000000000000000000000000000000abcd',
      isConnected: true,
      isConnecting: false,
      extensionInstalled: true,
      searchingExtension: false,
      currentNetwork: 'testnet' as const,
      error: undefined,
      connect: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
    }),
    useTransaction: () => ({
      sendKLV,
      sendKDA: vi.fn(),
      sendTransaction: vi.fn(),
      isLoading: txState.isLoading,
      error: txState.error,
      data: txState.data,
      reset,
    }),
  }
})

import { App } from '../App'

describe('send-klv-transfer', () => {
  it('flags an invalid recipient address', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('to-input'), { target: { value: 'not-an-address' } })
    expect(screen.getByTestId('to-error')).toBeInTheDocument()
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })

  it('calls sendKLV with parseKLV(amount) on valid submit', async () => {
    render(<App />)
    // A valid bech32 klv1 address with correct checksum.
    const validAddr = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
    fireEvent.change(screen.getByTestId('to-input'), { target: { value: validAddr } })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '2.5' } })

    fireEvent.click(screen.getByTestId('submit-btn'))

    await waitFor(() => expect(sendKLV).toHaveBeenCalled())
    const [to, amount] = sendKLV.mock.calls[0]
    expect(to).toBe(validAddr)
    expect(amount).toBe(2_500_000n) // parseKLV('2.5')
  })

  it('renders success state with the tx hash', () => {
    txState.data = { hash: 'mock-tx-abc' }
    render(<App />)
    expect(screen.getByTestId('success')).toHaveTextContent('mock-tx-abc')
    txState.data = null
  })

  it('renders an error message when the SDK rejects', () => {
    txState.error = new Error('insufficient balance')
    render(<App />)
    expect(screen.getByTestId('error')).toHaveTextContent('insufficient balance')
    txState.error = null
  })
})
