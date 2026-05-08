import { describe, it, expect, vi, beforeEach } from 'vitest'

let waitImpl: () => Promise<unknown> = async () => ({ status: 'success' })

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async waitForTransaction(): Promise<unknown> {
      return waitImpl()
    }
    async getTransaction(): Promise<unknown> {
      return null
    }
  }
  return { KleverProvider: FakeProvider }
})

describe('tx-poll-until-confirmed example', () => {
  beforeEach(() => {
    process.env['TX_HASH'] = 'a'.repeat(64)
    process.env['TIMEOUT_MS'] = '1500'
    process.env['POLL_INTERVAL_MS'] = '100'
  })

  it('exits 0 on a successful confirmation', async () => {
    waitImpl = async () => ({ status: 'success' })
    vi.resetModules()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 50))
    // No exit(1) or exit(2) was called — only the natural completion path.
    const calledWithFailure = exitSpy.mock.calls.some(
      (c) => c[0] === 1 || c[0] === 2,
    )
    expect(calledWithFailure).toBe(false)
    exitSpy.mockRestore()
  })

  it('exits 2 when the SDK call hangs past TIMEOUT_MS', async () => {
    waitImpl = () => new Promise(() => undefined) // never resolves
    vi.resetModules()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 1700))
    const sawTimeoutExit = exitSpy.mock.calls.some((c) => c[0] === 2)
    expect(sawTimeoutExit).toBe(true)
    exitSpy.mockRestore()
  }, 5_000)
})
