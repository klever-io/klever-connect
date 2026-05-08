import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeFileSync, mkdirSync, unlinkSync, rmdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ABI_PATH = resolve('./_test-counter.abi.json')

const captured: { invokes: Array<{ fn: string; args: unknown[] }> } = { invokes: [] }

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    getTransactionUrl(h: string): string {
      return `x/${h}`
    }
  }
  class FakeWallet {
    address = 'klv1' + '0'.repeat(58)
    constructor(_p: unknown, _pk: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
  }
  class FakeContract {
    constructor(_a: unknown, _abi: unknown, _signer: unknown) {}
    async invoke(fn: string, ...args: unknown[]): Promise<{ hash: string; status: string }> {
      captured.invokes.push({ fn, args })
      return { hash: 'h'.repeat(64), status: 'pending' }
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    Contract: FakeContract,
    createKleverAddress: (s: string) => s,
  }
})

describe('sc-invoke-mutable example', () => {
  beforeEach(() => {
    captured.invokes.length = 0
    mkdirSync(dirname(ABI_PATH), { recursive: true })
    writeFileSync(
      ABI_PATH,
      JSON.stringify({
        name: 'counter',
        endpoints: [{ name: 'increment', mutability: 'mutable', inputs: [], outputs: [] }],
      }),
    )
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['CONTRACT_ADDRESS'] = 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z'
    process.env['ABI_PATH'] = ABI_PATH
    process.env['FUNCTION_NAME'] = 'increment'
    process.env['FUNCTION_ARGS'] = ''
    process.env['DRY_RUN'] = 'false'
  })

  it('invokes the configured function', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 30))
    try {
      unlinkSync(ABI_PATH)
    } catch {
      // ignore
    }
    expect(captured.invokes.length).toBe(1)
    expect(captured.invokes[0]!.fn).toBe('increment')
    expect(captured.invokes[0]!.args).toEqual([])
  })
})
