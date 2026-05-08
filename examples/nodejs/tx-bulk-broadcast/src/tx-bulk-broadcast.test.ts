import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { nonces: number[]; broadcasts: number } = { nonces: [], broadcasts: 0 }

vi.mock('@klever/connect', () => {
  class FakeTx {
    constructor(public nonce: number) {}
    toHex(): string {
      return `n${this.nonce}`
    }
  }
  class FakeBuilder {
    private _nonce = 0
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    nonce(n: number): this {
      this._nonce = n
      return this
    }
    transfer(_req: unknown): this {
      return this
    }
    async build(): Promise<FakeTx> {
      return new FakeTx(this._nonce)
    }
  }
  class FakeProvider {
    constructor(public cfg: unknown) {}
    async getAccount(): Promise<{ nonce: number }> {
      return { nonce: 100 }
    }
  }
  class FakeWallet {
    address = 'klv1' + '0'.repeat(58)
    constructor(_p: unknown, _pk: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    async signTransaction(tx: FakeTx): Promise<FakeTx> {
      captured.nonces.push(tx.nonce)
      return tx
    }
    async broadcastTransactions(txs: FakeTx[]): Promise<string[]> {
      captured.broadcasts++
      return txs.map((t) => `hash-${t.nonce}`)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
    parseKLV: (v: string) => BigInt(Math.floor(Number(v) * 1_000_000)),
  }
})

describe('tx-bulk-broadcast example', () => {
  beforeEach(() => {
    captured.nonces.length = 0
    captured.broadcasts = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['RECIPIENTS_JSON'] = JSON.stringify([
      { receiver: 'klv1' + '1'.repeat(58), amount: '100' },
      { receiver: 'klv1' + '2'.repeat(58), amount: '200' },
      { receiver: 'klv1' + '3'.repeat(58), amount: '300' },
    ])
    process.env['AMOUNT_UNIT'] = 'raw'
    process.env['DRY_RUN'] = 'true'
  })

  it('assigns monotonically increasing nonces', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.nonces).toEqual([100, 101, 102])
  })

  it('does not broadcast when DRY_RUN=true', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.broadcasts).toBe(0)
  })

  it('broadcasts once when DRY_RUN=false', async () => {
    process.env['DRY_RUN'] = 'false'
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.broadcasts).toBe(1)
  })
})
