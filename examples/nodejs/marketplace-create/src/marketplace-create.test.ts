import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'cafe'
    }
  }
  class FakeBuilder {
    private _c: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    createMarketplace(req: Record<string, unknown>): this {
      this._c = { contractType: 20, ...req }
      captured.contracts.push(this._c)
      return this
    }
    async build(): Promise<FakeTx> {
      return new FakeTx()
    }
  }
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
    async signTransaction(tx: FakeTx): Promise<FakeTx> {
      return tx
    }
    async broadcastTransaction(): Promise<string> {
      return 'f'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('marketplace-create example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['MARKETPLACE_NAME'] = 'TestMP'
    process.env['REFERRAL_ADDRESS'] = ''
    process.env['REFERRAL_PERCENTAGE'] = '0'
    process.env['DRY_RUN'] = 'true'
  })

  it('forwards the marketplace name', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts[0]!['contractType']).toBe(20)
    expect(captured.contracts[0]!['name']).toBe('TestMP')
  })

  it('forwards an optional referral configuration', async () => {
    process.env['REFERRAL_ADDRESS'] = 'klv1' + '1'.repeat(58)
    process.env['REFERRAL_PERCENTAGE'] = '250'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['referralAddress']).toBe('klv1' + '1'.repeat(58))
    expect(c['referralPercentage']).toBe(250)
  })
})
