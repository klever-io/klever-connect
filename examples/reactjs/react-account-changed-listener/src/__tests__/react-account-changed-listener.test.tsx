// Mocked-default test for `react-account-changed-listener`.
//
// Strategy:
//   1. Replace `useKlever` and `useBalance` with vi.fn-backed implementations
//      so we have full control over `wallet`, `address`, etc.
//   2. Hand the App a MockWallet that exposes a real `.on/.off/.emit` event
//      bus.
//   3. Trigger `wallet.emit('accountChanged', { address: 'klv1new...' })` and
//      assert the on-screen log captures the switch.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MockWallet } from './mock-wallet'

// `useKlever` and `useBalance` are pulled from the umbrella package by App.tsx.
// We hijack those exports so the App sees the mock context we control here.
const mockState = {
  wallet: undefined as MockWallet | undefined,
  address: undefined as string | undefined,
  isConnected: false,
  extensionInstalled: false,
}
const refetch = vi.fn(async () => undefined)

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@klever/connect')
  return {
    ...actual,
    useKlever: () => ({
      ...mockState,
      connect: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
    }),
    useBalance: () => ({
      balance: { token: 'KLV', amount: 1000000n, precision: 6, formatted: '1' },
      isLoading: false,
      error: null,
      refetch,
    }),
    KleverProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

// Late import so the mocks are in place.
const { App } = await import('../App')

describe('react-account-changed-listener', () => {
  beforeEach(() => {
    refetch.mockClear()
  })

  it('shows the no-extension warning when the extension is missing', () => {
    mockState.wallet = undefined
    mockState.address = undefined
    mockState.isConnected = false
    mockState.extensionInstalled = false
    render(<App />)
    expect(screen.getByTestId('no-extension')).toBeInTheDocument()
  })

  it('captures accountChanged events and refetches the balance', () => {
    const wallet = new MockWallet('klv1aaa')
    mockState.wallet = wallet
    mockState.address = 'klv1aaa'
    mockState.isConnected = true
    mockState.extensionInstalled = true

    render(<App />)
    expect(screen.getByTestId('no-events')).toBeInTheDocument()

    // Simulate the extension reporting a new account.
    act(() => {
      wallet.emit('accountChanged', { address: 'klv1bbb' })
    })

    const log = screen.getByTestId('event-log')
    expect(log.textContent).toContain('klv1aaa')
    expect(log.textContent).toContain('klv1bbb')

    // refetch was triggered by the listener.
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('removes the listener on unmount (no leaks)', () => {
    const wallet = new MockWallet('klv1xxx')
    mockState.wallet = wallet
    mockState.address = 'klv1xxx'
    mockState.isConnected = true
    mockState.extensionInstalled = true

    const { unmount } = render(<App />)
    unmount()

    // After unmount, emitting should be a no-op (no error, no refetch).
    act(() => {
      wallet.emit('accountChanged', { address: 'klv1yyy' })
    })
    expect(refetch).not.toHaveBeenCalled()
  })
})
