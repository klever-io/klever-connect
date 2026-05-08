import { describe, it, expect, vi, beforeEach } from 'vitest'

const blockSeq: number[] = []
const captured: { events: Array<{ name: string; data: unknown }> } = { events: [] }

vi.mock('@klever/connect', () => {
  let cursor = 0
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async getBlockNumber(): Promise<number> {
      const v = blockSeq[Math.min(cursor, blockSeq.length - 1)]!
      cursor = Math.min(cursor + 1, blockSeq.length - 1)
      return v
    }
    async getBlock(h: number): Promise<{ hash: string; timestamp: number }> {
      return { hash: `h${h}`, timestamp: Date.now() }
    }
  }
  return { KleverProvider: FakeProvider }
})

describe('block-monitor example', () => {
  beforeEach(() => {
    captured.events.length = 0
    blockSeq.length = 0
    blockSeq.push(100, 100, 101, 102, 103, 104, 105)
    process.env['POLL_INTERVAL_MS'] = '20'
    process.env['SLOW_BLOCK_THRESHOLD_MS'] = '60000'
    process.env['MAX_BLOCKS'] = '3'
  })

  it('observes MAX_BLOCKS and stops', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      captured.events.push({ name: 'log', data: args })
    })
    vi.resetModules()
    await import('./index.js')
    // Wait a bit for the poll loop.
    await new Promise((r) => setTimeout(r, 250))
    const blockLines = captured.events.filter(
      (e) => Array.isArray(e.data) && String((e.data as unknown[])[0]).startsWith('[block]'),
    )
    expect(blockLines.length).toBeGreaterThanOrEqual(3)
    logSpy.mockRestore()
  })
})
