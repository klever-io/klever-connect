// MockWallet — a lightweight in-memory implementation of the `Wallet`
// surface used by `@klever/connect-react`. Reused across all reactjs
// examples that need to drive `useKlever` / `useTransaction` from tests
// without a real extension.
//
// We deliberately do NOT extend BaseWallet: BaseWallet pulls in real
// crypto + provider deps that complicate a unit test. Instead we satisfy
// the `Wallet` shape structurally — TypeScript's structural typing accepts
// us anywhere a `Wallet` is expected.

import type { Wallet } from '@klever/connect'

type Listener = (...args: unknown[]) => void

export class MockWallet {
  address: string
  publicKey: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any
  isConnected = true

  // Replaceable spies — tests overwrite these to assert call shape.
  transfer = vi.fn(async () => ({ hash: 'mock_tx_hash', status: 'pending' }))
  sendTransaction = vi.fn(async () => ({ hash: 'mock_tx_hash', status: 'pending' }))
  signMessage = vi.fn(async (m: Uint8Array) => m)
  signTransaction = vi.fn(async (t: unknown) => t)
  broadcastTransaction = vi.fn(async () => ({ hash: 'mock_tx_hash', status: 'pending' }))
  broadcastTransactions = vi.fn(async () => [])
  getBalance = vi.fn(async () => 0n)
  getNonce = vi.fn(async () => 0)
  encrypt = vi.fn(async () => '{}')
  connect = vi.fn(async () => undefined)
  disconnect = vi.fn(() => undefined)

  private listeners = new Map<string, Set<Listener>>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(address = 'klv1mockaddr0', provider: any = {}) {
    this.address = address
    this.publicKey = 'mockpubkey'
    this.provider = provider
  }

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    return this
  }
  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn)
    return this
  }
  removeAllListeners(event?: string) {
    if (event) this.listeners.delete(event)
    else this.listeners.clear()
    return this
  }
  // Test-only helper: synchronously invoke all listeners for `event`. Real
  // wallets emit asynchronously; we keep it sync to avoid awkward awaits in
  // tests.
  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((fn) => fn(...args))
  }
}

// Cast helper for when TS strict-mode complains about the structural type.
export const asWallet = (m: MockWallet): Wallet => m as unknown as Wallet
