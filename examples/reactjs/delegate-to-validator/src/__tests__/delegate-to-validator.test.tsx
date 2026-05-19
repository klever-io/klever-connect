import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const delegate = vi.fn(async () => ({
  hash: 'mock-hash',
  status: 'success' as const,
  transaction: undefined as never,
  wait: async () => ({}),
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
      freeze: vi.fn(),
      unfreeze: vi.fn(),
      delegate,
      undelegate: vi.fn(),
      claim: vi.fn(),
      withdraw: vi.fn(),
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('delegate-to-validator', () => {
  it('passes (validator, bucketId) when both are filled', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('validator-input'), {
      target: { value: 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z' },
    })
    fireEvent.change(screen.getByTestId('bucket-input'), { target: { value: 'bucket-abc' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(delegate).toHaveBeenCalled())
    expect(delegate).toHaveBeenCalledWith(
      'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
      'bucket-abc',
    )
  })

  it('passes bucketId=undefined when blank', async () => {
    delegate.mockClear()
    render(<App />)
    fireEvent.change(screen.getByTestId('validator-input'), {
      target: { value: 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z' },
    })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(delegate).toHaveBeenCalled())
    expect(delegate).toHaveBeenCalledWith(
      'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
      undefined,
    )
  })

  it('rejects an invalid validator address', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('validator-input'), { target: { value: 'not-an-address' } })
    expect(screen.getByTestId('validator-error')).toBeInTheDocument()
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })
})
