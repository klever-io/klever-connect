import { describe, it, expect, vi } from 'vitest'
import { kleverReducer } from '../reducer'
import type { KleverState } from '../types'

vi.mock('@klever/connect-provider', async () => {
  const actual = await vi.importActual('@klever/connect-provider')
  return {
    ...actual,
    getNetworkName: vi.fn((network: string) => (typeof network === 'string' ? network : 'mainnet')),
  }
})

const baseState: KleverState = {
  isConnected: false,
  isConnecting: false,
  extensionInstalled: false,
  searchingExtension: false,
  currentNetwork: 'mainnet',
  provider: undefined as never,
}

describe('kleverReducer', () => {
  it('SET_WALLET — marks as connected with address', () => {
    const mockWallet = {} as never
    const next = kleverReducer(baseState, {
      type: 'SET_WALLET',
      wallet: mockWallet,
      address: 'klv1abc',
    })
    expect(next.isConnected).toBe(true)
    expect(next.isConnecting).toBe(false)
    expect(next.address).toBe('klv1abc')
    expect(next.wallet).toBe(mockWallet)
  })

  it('SET_CONNECTING — updates connecting flag', () => {
    const next = kleverReducer(baseState, { type: 'SET_CONNECTING', isConnecting: true })
    expect(next.isConnecting).toBe(true)
  })

  it('SET_ERROR — stores error and stops connecting', () => {
    const err = new Error('failed')
    const next = kleverReducer(
      { ...baseState, isConnecting: true },
      { type: 'SET_ERROR', error: err },
    )
    expect(next.error).toBe(err)
    expect(next.isConnecting).toBe(false)
  })

  it('DISCONNECT — removes wallet and marks disconnected', () => {
    const mockWallet = {} as never
    const connected = { ...baseState, isConnected: true, wallet: mockWallet, address: 'klv1abc' }
    const next = kleverReducer(connected, { type: 'DISCONNECT' })
    expect(next.isConnected).toBe(false)
    expect(next.isConnecting).toBe(false)
    expect(next.wallet).toBeUndefined()
    expect(next.address).toBeUndefined()
  })

  it('RESET_ERROR — removes error from state', () => {
    const withError = { ...baseState, error: new Error('oops') }
    const next = kleverReducer(withError, { type: 'RESET_ERROR' })
    expect(next.error).toBeUndefined()
  })

  it('SET_EXTENSION_INSTALLED — updates flag', () => {
    const next = kleverReducer(baseState, { type: 'SET_EXTENSION_INSTALLED', installed: true })
    expect(next.extensionInstalled).toBe(true)
  })

  it('SET_SEARCHING_EXTENSION — updates flag', () => {
    const next = kleverReducer(baseState, { type: 'SET_SEARCHING_EXTENSION', searching: true })
    expect(next.searchingExtension).toBe(true)
  })

  it('SET_NETWORK — updates current network', () => {
    const next = kleverReducer(baseState, { type: 'SET_NETWORK', network: 'testnet' })
    expect(next.currentNetwork).toBe('testnet')
  })

  it('SET_PROVIDER — updates provider', () => {
    const mockProvider = {} as never
    const next = kleverReducer(baseState, { type: 'SET_PROVIDER', provider: mockProvider })
    expect(next.provider).toBe(mockProvider)
  })

  it('unknown action — returns current state unchanged', () => {
    const next = kleverReducer(baseState, { type: 'UNKNOWN' } as never)
    expect(next).toBe(baseState)
  })
})
