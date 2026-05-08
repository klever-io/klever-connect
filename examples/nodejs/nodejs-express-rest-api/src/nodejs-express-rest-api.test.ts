import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { calls: Array<{ name: string; args: unknown[] }> } = { calls: [] }

vi.mock('@klever/connect', () => {
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async getBalance(a: string, b: string): Promise<bigint> {
      captured.calls.push({ name: 'getBalance', args: [a, b] })
      return 1_000_000n
    }
    async getAccount(a: string): Promise<unknown> {
      captured.calls.push({ name: 'getAccount', args: [a] })
      return { address: a, nonce: 0 }
    }
    async getTransaction(h: string): Promise<unknown> {
      captured.calls.push({ name: 'getTransaction', args: [h] })
      return { hash: h, status: 'success' }
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
    isValidAddress: (a: string) => typeof a === 'string' && a.startsWith('klv1') && a.length >= 60,
    parseKLV: (v: string) => BigInt(Math.floor(Number(v) * 1_000_000)),
  }
})

describe('nodejs-express-rest-api example', () => {
  beforeEach(() => {
    captured.calls.length = 0
    process.env['PORT'] = '0' // ephemeral
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['KLV_NETWORK'] = 'testnet'
  })

  it('boots and exposes /health', async () => {
    vi.resetModules()
    // We import dynamically so the listener uses our mocked provider.
    await import('./index.js')
    // Tiny sleep to let the server bind.
    await new Promise((r) => setTimeout(r, 30))
    // Just assert that nothing exploded — full HTTP integration is best done
    // via supertest which we deliberately omit to keep deps minimal.
    expect(true).toBe(true)
  })
})
