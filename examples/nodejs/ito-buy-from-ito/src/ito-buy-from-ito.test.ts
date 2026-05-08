import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return '1701'
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
      return '6'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('ito-buy-from-ito example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['KDA_ID'] = 'MYTKN-AB12'
    process.env['CURRENCY_ID'] = 'KLV'
    process.env['AMOUNT'] = '5'
    process.env['CURRENCY_AMOUNT'] = '5000000'
    process.env['DRY_RUN'] = 'true'
  })

  it('always sends buyType=1 for the ITO path', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['contractType']).toBe(17)
    expect(c['buyType']).toBe(1)
    expect(c['id']).toBe('MYTKN-AB12')
    expect(c['amount']).toBe('5')
    expect(c['currencyAmount']).toBe('5000000')
  })
})
