/**
 * Mocked vitest for validator-create.
 *
 * The goal of this test is to prove the example assembles the correct
 * CreateValidator request from environment variables WITHOUT touching a real
 * provider. We mock the entire `@klever/connect` umbrella so we can intercept
 * the contract request that would have been broadcast.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

interface CapturedContract {
  contractType: number
  blsPublicKey: string
  ownerAddress: string
  rewardAddress?: string
  canDelegate?: boolean
  commission: number
  maxDelegationAmount?: bigint | string | number
  name?: string
}

const captured: { contracts: CapturedContract[] } = { contracts: [] }

vi.mock('@klever/connect', () => {
  class FakeTransaction {
    constructor(public payload: unknown) {}
    toHex(): string {
      return '0a' + '0'.repeat(140)
    }
  }
  class FakeBuilder {
    private _sender = ''
    private _contract: Record<string, unknown> = {}
    constructor(_provider: unknown) {}
    sender(addr: string): this {
      this._sender = addr
      return this
    }
    createValidator(req: Record<string, unknown>): this {
      this._contract = { contractType: 2, ...req }
      captured.contracts.push(this._contract as unknown as CapturedContract)
      return this
    }
    async build(): Promise<FakeTransaction> {
      return new FakeTransaction({ sender: this._sender, contract: this._contract })
    }
  }
  class FakeProvider {
    constructor(public cfg: unknown) {}
    getTransactionUrl(hash: string): string {
      return `https://example.invalid/tx/${hash}`
    }
  }
  class FakeWallet {
    address = 'klv1' + '0'.repeat(58)
    constructor(public provider: unknown, public _pk: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    async signTransaction(tx: FakeTransaction): Promise<FakeTransaction> {
      return tx
    }
    async broadcastTransaction(_tx: FakeTransaction): Promise<string> {
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

describe('validator-create example', () => {
  beforeEach(() => {
    captured.contracts.length = 0
    process.env['PRIVATE_KEY'] = 'a'.repeat(64)
    process.env['BLS_PUBLIC_KEY'] = 'b'.repeat(192)
    process.env['REWARD_ADDRESS'] = ''
    process.env['CAN_DELEGATE'] = 'true'
    process.env['COMMISSION'] = '500'
    process.env['MAX_DELEGATION_AMOUNT'] = '1000'
    process.env['VALIDATOR_NAME'] = 'TestValidator'
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['DRY_RUN'] = 'true'
  })

  it('builds a CreateValidator request with the configured fields', async () => {
    // Re-import the example to re-run its top-level body with our env.
    vi.resetModules()
    await import('./index.js')
    // Wait a tick for the async main() to settle. The fake provider does not
    // throw, so success means the contract was captured.
    await new Promise((r) => setTimeout(r, 10))
    expect(captured.contracts.length).toBeGreaterThan(0)
    const c = captured.contracts[0]!
    expect(c.contractType).toBe(2)
    expect(c.blsPublicKey).toBe('b'.repeat(192))
    expect(c.commission).toBe(500)
    expect(c.canDelegate).toBe(true)
    expect(c.name).toBe('TestValidator')
    expect(c.maxDelegationAmount).toBe(1_000_000_000n)
  })
})
