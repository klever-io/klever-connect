import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'feed'
    }
  }
  class FakeBuilder {
    private _contract: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    vote(req: Record<string, unknown>): this {
      this._contract = { contractType: 14, ...req }
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
      return 'e'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('governance-vote example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['PROPOSAL_ID'] = '42'
    process.env['VOTE_AMOUNT'] = ''
    process.env['DRY_RUN'] = 'true'
  })

  it('encodes YES as type=0', async () => {
    process.env['VOTE'] = 'yes'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts[0]!['type']).toBe(0)
    expect(captured.contracts[0]!['proposalId']).toBe(42)
  })

  it('encodes NO as type=1', async () => {
    process.env['VOTE'] = 'no'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts[0]!['type']).toBe(1)
  })

  it('forwards a custom amount as a string', async () => {
    process.env['VOTE'] = 'yes'
    process.env['VOTE_AMOUNT'] = '1000000'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts[0]!['amount']).toBe('1000000')
  })
})
