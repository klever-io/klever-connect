import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'da7a'
    }
  }
  class FakeBuilder {
    private _c: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    configITO(req: Record<string, unknown>): this {
      this._c = { contractType: 15, ...req }
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
      return '4'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('ito-configure example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['KDA_ID'] = 'MYTKN-AB12'
    process.env['STATUS'] = '1'
    process.env['MAX_AMOUNT'] = '1000000'
    process.env['PACK_INFO_JSON'] =
      '{"KLV":{"packs":[{"amount":"1","price":"1000000"}]}}'
    process.env['RECEIVER_ADDRESS'] = ''
    process.env['DEFAULT_LIMIT_PER_ADDRESS'] = ''
    process.env['WHITELIST_STATUS'] = ''
    process.env['START_TIME'] = ''
    process.env['END_TIME'] = ''
    process.env['WHITELIST_START_TIME'] = ''
    process.env['WHITELIST_END_TIME'] = ''
    process.env['DRY_RUN'] = 'true'
  })

  it('parses packInfo JSON and forwards numeric status', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['contractType']).toBe(15)
    expect(c['kda']).toBe('MYTKN-AB12')
    expect(c['status']).toBe(1)
    const packInfo = c['packInfo'] as Record<string, { packs: { amount: string }[] }>
    expect(packInfo['KLV']!.packs[0]!.amount).toBe('1')
  })
})
