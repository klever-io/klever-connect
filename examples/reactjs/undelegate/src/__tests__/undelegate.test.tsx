import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const undelegate = vi.fn(async () => ({
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
      delegate: vi.fn(),
      undelegate,
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

describe('undelegate', () => {
  it('passes the bucket id to undelegate()', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('bucket-input'), { target: { value: 'bucket-xyz' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(undelegate).toHaveBeenCalledWith('bucket-xyz'))
  })

  it('disables submit when bucket is empty', () => {
    render(<App />)
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })
})
