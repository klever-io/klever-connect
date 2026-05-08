import { describe, it, expect, vi, beforeEach } from 'vitest'

const balanceSeq = new Map<string, bigint[]>()

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async getBalance(addr: string): Promise<bigint> {
      const seq = balanceSeq.get(addr) ?? [0n]
      const v = seq.shift() ?? seq[seq.length - 1] ?? 0n
      if (seq.length > 0) balanceSeq.set(addr, seq)
      return v
    }
  }
  return { KleverProvider: FakeProvider, formatKLV: (v: bigint) => String(v) }
})

describe('balance-alert-watcher example', () => {
  beforeEach(() => {
    balanceSeq.clear()
    process.env['ADDRESSES'] = 'klv1' + 'x'.repeat(58)
    process.env['ASSET_ID'] = 'KLV'
    process.env['POLL_INTERVAL_MS'] = '20'
    process.env['MIN_DELTA'] = '10'
    process.env['MAX_POLLS'] = '3'
  })

  it('logs init then alert when balance crosses MIN_DELTA', async () => {
    const ADDR = 'klv1' + 'x'.repeat(58)
    balanceSeq.set(ADDR, [100n, 100n, 200n])
    const lines: string[] = []
    const logSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      lines.push(args.map(String).join(' '))
    })
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 200))
    expect(lines.some((l) => l.includes('[init]'))).toBe(true)
    expect(lines.some((l) => l.includes('[alert]') && l.includes('INCOMING'))).toBe(true)
    logSpy.mockRestore()
    exitSpy.mockRestore()
  })
})
