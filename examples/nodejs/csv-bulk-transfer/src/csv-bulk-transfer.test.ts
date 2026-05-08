import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { writeFileSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

const TMP = resolve('./_test-recipients.csv')
const captured: { nonces: number[]; broadcasts: number[][] } = { nonces: [], broadcasts: [] }

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
      return { nonce: 0 }
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
      captured.broadcasts.push(txs.map((t) => t.nonce))
      return txs.map((t) => `h-${t.nonce}`)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
    parseKLV: (v: string) => BigInt(Math.floor(Number(v) * 1_000_000)),
    isValidAddress: (a: string) => typeof a === 'string' && a.startsWith('klv1') && a.length >= 60,
  }
})

const ADDR = 'klv1' + '1'.repeat(58)

describe('csv-bulk-transfer example', () => {
  beforeEach(() => {
    captured.nonces.length = 0
    captured.broadcasts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['CSV_PATH'] = TMP
    process.env['AMOUNT_UNIT'] = 'human'
    process.env['BATCH_SIZE'] = '2'
    process.env['DRY_RUN'] = 'false'
    writeFileSync(
      TMP,
      `receiver,amount,kda\n${ADDR},1,\n${ADDR},2,\n${ADDR},3,KFI\n`,
    )
  })

  afterEach(() => {
    try {
      unlinkSync(TMP)
    } catch {
      // ignore
    }
  })

  it('parses 3 rows and slices them into batches of 2', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 30))
    expect(captured.nonces).toEqual([0, 1, 2])
    // Two batches: [0,1] and [2]
    expect(captured.broadcasts.length).toBe(2)
    expect(captured.broadcasts[0]).toEqual([0, 1])
    expect(captured.broadcasts[1]).toEqual([2])
  })
})
