import { describe, it, expect, vi, beforeEach } from 'vitest'

const captured: { contracts: Record<string, unknown>[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTx {
    toHex(): string {
      return '0a' + '0'.repeat(160)
    }
  }
  class FakeBuilder {
    private _c: Record<string, unknown> = {}
    constructor(_p: unknown) {}
    sender(_a: string): this {
      return this
    }
    updateAccountPermission(req: Record<string, unknown>): this {
      this._c = { contractType: 22, ...req }
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
      return '8'.repeat(64)
    }
  }
  return {
    KleverProvider: FakeProvider,
    NodeWallet: FakeWallet,
    TransactionBuilder: FakeBuilder,
  }
})

describe('account-permissions-update example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['PERMISSIONS_JSON'] = JSON.stringify([
      {
        type: 0,
        permissionName: 'owner',
        threshold: 2,
        operations: '0x000000',
        signers: [
          { address: 'klv1' + 'a'.repeat(58), weight: 1 },
          { address: 'klv1' + 'b'.repeat(58), weight: 1 },
        ],
      },
    ])
    process.env['BROADCAST_SINGLE_SIGNED'] = 'false'
  })

  it('builds the permissions request from the JSON env var', async () => {
    vi.resetModules()
    await import('./index.js')
    await new Promise((r) => setTimeout(r, 10))
    const c = captured.contracts[0]!
    expect(c['contractType']).toBe(22)
    const perms = c['permissions'] as Array<{ signers: unknown[] }>
    expect(perms.length).toBe(1)
    expect(perms[0]!.signers.length).toBe(2)
  })
})
