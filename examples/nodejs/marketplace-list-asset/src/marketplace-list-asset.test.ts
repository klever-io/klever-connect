import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'beadface'
    }
  }
  class FakeBuilder {
    private _c: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    sell(req: Record<string, unknown>): this {
      this._c = { contractType: 18, ...req }
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
      return '1'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('marketplace-list-asset example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['MARKETPLACE_ID'] = 'b'.repeat(64)
    process.env['ASSET_ID'] = 'KFI'
    process.env['PRICE'] = '1000000'
    process.env['MARKET_TYPE'] = '0'
    process.env['CURRENCY_ID'] = 'KLV'
    process.env['RESERVE_PRICE'] = ''
    process.env['END_TIME'] = ''
    process.env['DRY_RUN'] = 'true'
  })

  it('builds a BuyItNow listing', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts[0]!['contractType']).toBe(18)
    expect(captured.contracts[0]!['marketType']).toBe(0)
    expect(captured.contracts[0]!['endTime']).toBeUndefined()
  })

  it('requires endTime for auctions', async () => {
    process.env['MARKET_TYPE'] = '1'
    process.env['END_TIME'] = ''
    vi.resetModules()
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 20))
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('builds an auction listing when END_TIME is provided', async () => {
    process.env['MARKET_TYPE'] = '1'
    process.env['END_TIME'] = '1800000000'
    process.env['RESERVE_PRICE'] = '2000000'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts[0]!['marketType']).toBe(1)
    expect(captured.contracts[0]!['endTime']).toBe('1800000000')
    expect(captured.contracts[0]!['reservePrice']).toBe('2000000')
  })
})
