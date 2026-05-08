import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { calls: Array<{ name: string; args: unknown[] }> } = { calls: [] }

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async getBalance(addr: string, asset?: string): Promise<bigint> {
      captured.calls.push({ name: 'getBalance', args: [addr, asset] })
      return 1_000_000n
    }
    async getAccount(addr: string): Promise<unknown> {
      captured.calls.push({ name: 'getAccount', args: [addr] })
      return { nonce: 0, balance: '1000000' }
    }
    async getTransaction(hash: string): Promise<unknown> {
      captured.calls.push({ name: 'getTransaction', args: [hash] })
      return { hash, status: 'success' }
    }
    async requestTestKLV(addr: string): Promise<unknown> {
      captured.calls.push({ name: 'requestTestKLV', args: [addr] })
      return { ok: true }
    }
  }
  class FakeWallet {
    address = 'klv1' + '0'.repeat(58)
    constructor(_p: unknown, _pk: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    async transfer(p: unknown): Promise<{ hash: string; status: string }> {
      captured.calls.push({ name: 'transfer', args: [p] })
      return { hash: 'h'.repeat(64), status: 'pending' }
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    formatKLV: (v: bigint) => String(v),
    parseKLV: (v: string) => BigInt(Math.floor(Number(v) * 1_000_000)),
    isValidAddress: (a: string) => typeof a === 'string' && a.startsWith('klv1') && a.length >= 60,
  }
})

describe('nodejs-cli-wallet example', () => {
  beforeEach(() => {
    captured.calls.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['KLV_NETWORK'] = 'testnet'
  })

  it('balance command calls getBalance', async () => {
    process.argv = ['node', 'cli', 'balance', '--address', 'klv1' + '1'.repeat(58)]
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 30))
    expect(captured.calls.some((c) => c.name === 'getBalance')).toBe(true)
    logSpy.mockRestore()
  })

  it('tx command requires --hash', async () => {
    process.argv = ['node', 'cli', 'tx']
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 30))
    expect(errSpy).toHaveBeenCalled()
    exitSpy.mockRestore()
    errSpy.mockRestore()
  })

  it('transfer command builds a transfer call', async () => {
    process.argv = [
      'node',
      'cli',
      'transfer',
      '--to',
      'klv1' + '2'.repeat(58),
      '--amount',
      '1.5',
    ]
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 30))
    expect(captured.calls.some((c) => c.name === 'transfer')).toBe(true)
    logSpy.mockRestore()
  })
})
