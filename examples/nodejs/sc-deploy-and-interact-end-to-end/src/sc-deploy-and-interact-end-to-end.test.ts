import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const WASM = resolve('./_test-counter.wasm')
const ABI = resolve('./_test-counter.abi.json')

const captured: { invokes: number; calls: number } = { invokes: 0, calls: 0 }

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async waitForTransaction(): Promise<unknown> {
      return {}
    }
    async getTransactionReceipt(): Promise<unknown> {
      return { logs: [] }
    }
  }
  class FakeWallet {
    address = 'klv1' + '0'.repeat(58)
    constructor(_p: unknown, _pk: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
  }
  class FakeFactory {
    static getDeployedAddress(): string {
      return 'klv1' + '7'.repeat(58)
    }
    constructor(_abi: unknown, _bc: unknown, _signer: unknown) {}
    async deploy(): Promise<unknown> {
      return { deployTransaction: { hash: 'h'.repeat(64) } }
    }
  }
  class FakeContract {
    constructor(_a: unknown, _abi: unknown, _signer: unknown) {}
    async invoke(): Promise<{ hash: string; status: string }> {
      captured.invokes++
      return { hash: 'i'.repeat(64), status: 'pending' }
    }
    async call(): Promise<number> {
      captured.calls++
      return 3
    }
    parseEvents(): unknown[] {
      return []
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    Contract: FakeContract,
    ContractFactory: FakeFactory,
    createKleverAddress: (s: string) => s,
  }
})

describe('sc-deploy-and-interact-end-to-end example', () => {
  beforeEach(() => {
    captured.invokes = 0
    captured.calls = 0
    mkdirSync(dirname(WASM), { recursive: true })
    writeFileSync(WASM, new Uint8Array([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0]))
    writeFileSync(ABI, JSON.stringify({ name: 'counter', endpoints: [] }))
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['WASM_PATH'] = WASM
    process.env['ABI_PATH'] = ABI
    process.env['INCREMENT_TIMES'] = '3'
  })

  it('runs the lifecycle: deploy + invoke×N + call', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 60))
    try {
      unlinkSync(WASM)
      unlinkSync(ABI)
    } catch {
      // ignore
    }
    expect(captured.invokes).toBe(3)
    expect(captured.calls).toBe(1)
    logSpy.mockRestore()
  })
})
