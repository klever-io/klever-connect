import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const freeze = vi.fn(async () => ({
  hash: 'mock-hash-1',
  status: 'success' as const,
  transaction: undefined as never,
  wait: async () => ({ receipts: [{ bucketId: 'mock-bucket-abc' }] }),
}))

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
    useStaking: () => ({
      freeze,
      unfreeze: vi.fn(),
      delegate: vi.fn(),
      undelegate: vi.fn(),
      claim: vi.fn(),
      withdraw: vi.fn(),
      isLoading: false,
      error: null,
      data: { hash: 'mock-hash-1' },
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('freeze-for-staking', () => {
  it('calls freeze(parseKLV(amount)) for KLV by default', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '50' } })
    fireEvent.click(screen.getByTestId('submit-btn'))

    await waitFor(() => expect(freeze).toHaveBeenCalled())
    const [parsed, kda] = freeze.mock.calls[0]
    expect(parsed).toBe(50_000_000n)
    expect(kda).toBeUndefined()

    // Bucket id surfaces from receipt.
    await waitFor(() => expect(screen.getByTestId('bucket-id')).toHaveTextContent('mock-bucket-abc'))
  })

  it('passes a non-KLV kda + parseUnits(amount, precision) when KDA is custom', async () => {
    freeze.mockClear()
    render(<App />)
    fireEvent.change(screen.getByTestId('kda-input'), { target: { value: 'MTT-ABCD-1A' } })
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '10' } })
    fireEvent.change(screen.getByTestId('precision-input'), { target: { value: '8' } })

    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(freeze).toHaveBeenCalled())
    const [amount, kda] = freeze.mock.calls[0]
    expect(amount).toBe(1_000_000_000n)
    expect(kda).toBe('MTT-ABCD-1A')
  })
})
