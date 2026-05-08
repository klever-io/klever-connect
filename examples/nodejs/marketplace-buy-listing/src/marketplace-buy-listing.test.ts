import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'cab0'
    }
  }
  class FakeBuilder {
    private _c: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    buy(req: Record<string, unknown>): this {
      this._c = { contractType: 17, ...req }
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
      return '2'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('marketplace-buy-listing example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['ORDER_ID'] = 'c'.repeat(64)
    process.env['BUY_TYPE'] = '0'
    process.env['CURRENCY_ID'] = 'KLV'
    process.env['AMOUNT'] = ''
    process.env['CURRENCY_AMOUNT'] = '1000000'
    process.env['DRY_RUN'] = 'true'
  })

  it('builds a market Buy', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['contractType']).toBe(17)
    expect(c['buyType']).toBe(0)
    expect(c['id']).toBe('c'.repeat(64))
    expect(c['currencyAmount']).toBe('1000000')
  })

  it('rejects an unknown buyType', async () => {
    process.env['BUY_TYPE'] = '7'
    vi.resetModules()
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })
})
