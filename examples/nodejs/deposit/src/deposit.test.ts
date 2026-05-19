import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'd0d0'
    }
  }
  class FakeBuilder {
    private _c: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    deposit(req: Record<string, unknown>): this {
      this._c = { contractType: 23, ...req }
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
      return '9'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('deposit example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['DEPOSIT_TYPE'] = '0'
    process.env['KDA_ID'] = ''
    process.env['CURRENCY_ID'] = 'KLV'
    process.env['AMOUNT'] = '10000000'
    process.env['DRY_RUN'] = 'true'
    // The example's top-level `main().catch(... process.exit(1))` bubbles up
    // to vitest as a fatal error when a validation path runs. Stub process.exit
    // to a no-op so the test can observe the console.error output instead.
    vi.spyOn(process, 'exit').mockImplementation(((_code?: number) => undefined) as never)
  })

  it('builds an FPR deposit', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['depositType']).toBe(0)
    expect(c['amount']).toBe('10000000')
    expect(c['kda']).toBeUndefined()
  })

  it('requires KDA_ID for KDA deposits', async () => {
    process.env['DEPOSIT_TYPE'] = '1'
    process.env['KDA_ID'] = ''
    vi.resetModules()
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 20))
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('builds a KDA deposit when KDA_ID is provided', async () => {
    process.env['DEPOSIT_TYPE'] = '1'
    process.env['KDA_ID'] = 'MYTKN-AB12'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['depositType']).toBe(1)
    expect(c['kda']).toBe('MYTKN-AB12')
  })
})
