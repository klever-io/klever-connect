import { describe, it, expect, vi, beforeEach } from 'vitest'

const listeners: Record<string, Array<(d: unknown) => void>> = {}

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    on(name: string, listener: (d: unknown) => void): void {
      ;(listeners[name] ??= []).push(listener)
    }
    removeAllListeners(): void {
      Object.keys(listeners).forEach((k) => {
        delete listeners[k]
      })
    }
    connect(): void {
      // Synchronously emit a fake block so the test can assert wiring.
      ;(listeners['connect'] ?? []).forEach((l) => l(undefined))
      ;(listeners['block'] ?? []).forEach((l) => l({ blockNumber: 1, hash: 'h1' }))
    }
    disconnect(): void {}
  }
  return { KleverProvider: FakeProvider }
})

describe('provider-events-subscribe example', () => {
  beforeEach(() => {
    Object.keys(listeners).forEach((k) => {
      delete listeners[k]
    })
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['RUN_FOR_MS'] = '1000'
  })

  it('wires all five event listeners', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 50))
    expect(listeners['block']?.length).toBeGreaterThan(0)
    expect(listeners['pending']?.length).toBeGreaterThan(0)
    expect(listeners['error']?.length).toBeGreaterThan(0)
    expect(listeners['connect']?.length).toBeGreaterThan(0)
    expect(listeners['disconnect']?.length).toBeGreaterThan(0)
    exitSpy.mockRestore()
  })
})
