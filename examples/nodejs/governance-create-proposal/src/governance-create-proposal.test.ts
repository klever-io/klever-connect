import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'beef'
    }
  }
  class FakeBuilder {
    private _contract: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    proposal(req: Record<string, unknown>): this {
      this._contract = { contractType: 13, ...req }
      captured.contracts.push(this._contract)
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
      return 'd'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('governance-create-proposal example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['PROPOSAL_PARAMETERS'] = '{"22":"5000","23":"100"}'
    process.env['PROPOSAL_DESCRIPTION'] = 'Test description'
    process.env['PROPOSAL_EPOCHS_DURATION'] = '10'
    process.env['DRY_RUN'] = 'true'

    // The example main()s call process.exit(1) on validation failures; stub it to a no-op
    // so the test can observe the console.error output instead of vitest bailing fatally.
    vi.spyOn(process, 'exit').mockImplementation((_code) => undefined)
  })

  it('coerces JSON keys to numeric IDs and forwards every field', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts.length).toBe(1)
    const c = captured.contracts[0]!
    expect(c['contractType']).toBe(13)
    const params = c['parameters'] as Record<number, string>
    expect(params[22]).toBe('5000')
    expect(params[23]).toBe('100')
    expect(c['description']).toBe('Test description')
    expect(c['epochsDuration']).toBe(10)
  })

  it('rejects non-integer parameter ids', async () => {
    process.env['PROPOSAL_PARAMETERS'] = '{"abc":"5000"}'
    vi.resetModules()
    // The outer beforeEach already stubs process.exit to a no-op, so the
    // example's `main().catch(... process.exit(1))` won't bail the test.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })
})
