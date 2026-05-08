import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return 'deadbeef'
    }
  }
  class FakeBuilder {
    private _contract: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    validatorConfig(req: Record<string, unknown>): this {
      this._contract = { contractType: 3, ...req }
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
      return 'a'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
    parseKLV: (v: string) => BigInt(Math.floor(Number(v) * 1_000_000)),
  }
})

describe('validator-config example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['BLS_PUBLIC_KEY'] = 'b'.repeat(192)
    process.env['REWARD_ADDRESS'] = ''
    process.env['CAN_DELEGATE'] = 'false'
    process.env['COMMISSION'] = '700'
    process.env['MAX_DELEGATION_AMOUNT'] = ''
    process.env['VALIDATOR_NAME'] = 'NewName'
    process.env['DRY_RUN'] = 'true'
  })

  it('only sends fields the user supplied', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts.length).toBe(1)
    const c = captured.contracts[0]!
    expect(c['contractType']).toBe(3)
    expect(c['blsPublicKey']).toBe('b'.repeat(192))
    expect(c['canDelegate']).toBe(false)
    expect(c['commission']).toBe(700)
    expect(c['name']).toBe('NewName')
    // Untouched fields must NOT be on the request:
    expect(c['rewardAddress']).toBeUndefined()
    expect(c['maxDelegationAmount']).toBeUndefined()
  })
})
