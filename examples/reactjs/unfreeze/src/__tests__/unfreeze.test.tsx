import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const unfreeze = vi.fn(async () => ({
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
      unfreeze,
      delegate: vi.fn(),
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

describe('unfreeze', () => {
  it('calls unfreeze("KLV", bucketId) for a KLV bucket', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('bucket-input'), {
      target: { value: 'a'.repeat(64) },
    })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(unfreeze).toHaveBeenCalled())
    expect(unfreeze).toHaveBeenCalledWith('KLV', 'a'.repeat(64))
  })

  it('omits bucketId for non-KLV KDAs', async () => {
    unfreeze.mockClear()
    render(<App />)
    fireEvent.change(screen.getByTestId('kda-input'), { target: { value: 'MTT-ABCD-1A' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => expect(unfreeze).toHaveBeenCalled())
    expect(unfreeze).toHaveBeenCalledWith('MTT-ABCD-1A', undefined)
  })
})
