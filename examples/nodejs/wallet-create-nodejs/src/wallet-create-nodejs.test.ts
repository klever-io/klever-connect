/**
 * Mocked test for wallet-create-nodejs.
 * Stubs the umbrella module so the example exercises all three construction paths
 * with deterministic addresses and zero network/crypto cost.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@klever/connect', () => {
  let counter = 0
  const nextAddress = (): string => {
    counter += 1
    return `klv1mock0000000000000000000000000000000000000000000000000000000${counter}`
  }

  class MockNodeWallet {
    public address: string
    public publicKey = 'pubkey-hex'
    private connected = false
    constructor(_p: unknown, _k?: string) {
      this.address = nextAddress()
    }
    async connect(): Promise<void> {
      this.connected = true
    }
    async disconnect(): Promise<void> {
      this.connected = false
    }
    isConnected(): boolean {
      return this.connected
    }
    static async generate(p: unknown): Promise<MockNodeWallet> {
      return new MockNodeWallet(p)
    }
  }
  class MockKleverProvider {
    constructor(_o: unknown) {}
  }
  class MockWalletFactory {
    constructor(_p: unknown) {}
    async createRandom(): Promise<MockNodeWallet> {
      return new MockNodeWallet(undefined)
    }
  }
  return {
    KleverProvider: MockKleverProvider,
    NodeWallet: MockNodeWallet,
    WalletFactory: MockWalletFactory,
    isValidAddress: (a: string) => a.startsWith('klv1'),
  }
})

describe('wallet-create-nodejs (mocked)', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_NETWORK']
  })

  it('happy path — runs all three paths when KLV_PRIVATE_KEY is set', async () => {
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const messages = logSpy.mock.calls.map((c) => String(c[0]))
      expect(messages.some((m) => m.includes('Path 1'))).toBe(true)
      expect(messages.some((m) => m.includes('Path 2'))).toBe(true)
      expect(messages.some((m) => m.includes('Path 3'))).toBe(true)
      expect(messages.some((m) => m.includes('All three'))).toBe(true)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — skips Path 1 when KLV_PRIVATE_KEY is absent', async () => {
    delete process.env['KLV_PRIVATE_KEY']
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const messages = logSpy.mock.calls.map((c) => String(c[0]))
      expect(messages.some((m) => m.includes('skipped'))).toBe(true)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
