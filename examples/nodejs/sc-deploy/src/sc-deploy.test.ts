import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const WASM = resolve('./_test-counter.wasm')
const ABI = resolve('./_test-counter.abi.json')

const captured: { factories: number; deploys: unknown[][] } = { factories: 0, deploys: [] }

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
    constructor(_abi: unknown, _bc: unknown, _signer: unknown, _meta?: unknown) {
      captured.factories++
    }
    async deploy(...args: unknown[]): Promise<unknown> {
      captured.deploys.push(args)
      const c = {
        deployTransaction: { hash: 'h'.repeat(64) },
      }
      return c
    }
    static getDeployedAddress(): string {
      return 'klv1' + '7'.repeat(58)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    ContractFactory: FakeFactory,
  }
})

describe('sc-deploy example', () => {
  beforeEach(() => {
    captured.factories = 0
    captured.deploys.length = 0
    mkdirSync(dirname(WASM), { recursive: true })
    writeFileSync(WASM, new Uint8Array([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0]))
    writeFileSync(ABI, JSON.stringify({ name: 'counter', endpoints: [] }))
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['WASM_PATH'] = WASM
    process.env['ABI_PATH'] = ABI
    process.env['CONSTRUCTOR_ARGS'] = ''
  })

  it('reads the bytecode + ABI and deploys', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 50))
    try {
      unlinkSync(WASM)
      unlinkSync(ABI)
    } catch {
      // ignore
    }
    expect(captured.factories).toBe(1)
    expect(captured.deploys.length).toBe(1)
    logSpy.mockRestore()
  })
})
