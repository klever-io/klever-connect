import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const sendTransaction = vi.fn()

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
      sendKLV: vi.fn(),
      sendKDA: vi.fn(),
      sendTransaction,
      isLoading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }),
  }
})

import { App } from '../App'

describe('send-nft-transfer-with-royalties', () => {
  it('builds a Transfer contract with kda + klvRoyalties + kdaRoyalties', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('nft-input'), { target: { value: 'MYNFT-A1B2/1' } })
    fireEvent.change(screen.getByTestId('to-input'), {
      target: { value: 'klv1qqqqqqqqqqqqqpgqqcyx02a9wzaut7ssrxylwz9p4qy0fkadydq3w53tg' },
    })
    fireEvent.change(screen.getByTestId('klv-royalty-input'), { target: { value: '0.5' } })
    fireEvent.change(screen.getByTestId('kda-royalty-input'), { target: { value: '100' } })

    fireEvent.click(screen.getByTestId('submit-btn'))

    await waitFor(() => expect(sendTransaction).toHaveBeenCalled())
    const arg = sendTransaction.mock.calls[0][0]
    expect(arg.contractType).toBe(0) // Transfer
    expect(arg.receiver).toBe('klv1qqqqqqqqqqqqqpgqqcyx02a9wzaut7ssrxylwz9p4qy0fkadydq3w53tg')
    expect(arg.amount).toBe(1)
    expect(arg.kda).toBe('MYNFT-A1B2/1')
    expect(arg.klvRoyalties).toBe(500_000n) // parseKLV('0.5')
    expect(arg.kdaRoyalties).toBe(100n)
  })

  it('rejects malformed NFT id', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('nft-input'), { target: { value: 'NotAValidNftId' } })
    expect(screen.getByTestId('nft-error')).toBeInTheDocument()
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })
})
