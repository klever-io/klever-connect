import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ABI_PATH = resolve('./_test-payable.abi.json')

const captured: { invokes: Array<{ fn: string; args: unknown[]; opts?: unknown }> } = {
  invokes: [],
}

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
    async invoke(
      fn: string,
      ...args: unknown[]
    ): Promise<{ hash: string; status: string }> {
      const opts = args.length > 0 && typeof args[args.length - 1] === 'object' ? args.pop() : undefined
      captured.invokes.push({ fn, args, opts })
      return { hash: 'h'.repeat(64), status: 'pending' }
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    Contract: FakeContract,
    createKleverAddress: (s: string) => s,
    parseKLV: (v: string) => BigInt(Math.floor(Number(v) * 1_000_000)),
  }
})

describe('sc-invoke-payable-with-klv example', () => {
  beforeEach(() => {
    captured.invokes.length = 0
    mkdirSync(dirname(ABI_PATH), { recursive: true })
    writeFileSync(ABI_PATH, JSON.stringify({ name: 'p', endpoints: [] }))
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['CONTRACT_ADDRESS'] = 'klv1qqq' + 'q'.repeat(55)
    process.env['ABI_PATH'] = ABI_PATH
    process.env['FUNCTION_NAME'] = 'topUp'
    process.env['FUNCTION_ARGS'] = ''
    process.env['KLV_AMOUNT'] = '10'
    process.env['DRY_RUN'] = 'false'
  })

  it('passes the value option', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 30))
    try {
      unlinkSync(ABI_PATH)
    } catch {
      // ignore
    }
    expect(captured.invokes.length).toBe(1)
    const opts = captured.invokes[0]!.opts as { value: { KLV: bigint } } | undefined
    expect(opts?.value.KLV).toBe(10_000_000n)
  })
})
