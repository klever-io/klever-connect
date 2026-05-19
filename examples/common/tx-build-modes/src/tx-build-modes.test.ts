/**
 * Mocked tests for flow #15 — uses `vi.mock` to replace the network calls
 * (`buildTransaction` and `getNonce`) with deterministic stubs.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')

  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async getNonce(_addr: string) {
      return 5
    }
    async buildTransaction(_request: unknown) {
      // Mimic the testnet response shape used by TransactionBuilder.build().
      return {
        data: {
          result: {
            // A trivial proto-encoded "transaction" — 32 zero bytes hex —
            // sufficient for shape tests. Real tx hex is much longer.
            transaction: '00'.repeat(32),
          },
        },
      }
    }
  }
  return { ...actual, KleverProvider: MockProvider }
})

import { KleverProvider, TransactionBuilder, parseKLV, createKleverAddress } from '@klever/connect'

const SENDER = createKleverAddress('klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z')

describe('tx-build-modes (mocked)', () => {
  it('buildProto() returns a Transaction with hex output', () => {
    // The provider-backed `.build()` path is exercised in the testnet
    // tests (see *.testnet.test.ts). The offline `.buildProto()` path
    // is sufficient to verify the hex-output invariant here.
    const tx = new TransactionBuilder()
      .transfer({ receiver: SENDER, amount: parseKLV('1') })
      .buildProto({
        sender: SENDER,
        nonce: 1,
        chainId: '109',
        fees: { kAppFee: 500_000, bandwidthFee: 100_000 },
      })

    expect(typeof tx.toHex()).toBe('string')
    expect(tx.toHex().length).toBeGreaterThan(0)
  })

  it('buildProto() works fully offline (no provider on the builder)', () => {
    const tx = new TransactionBuilder()
      .transfer({ receiver: SENDER, amount: parseKLV('1') })
      .buildProto({
        sender: SENDER,
        nonce: 1,
        chainId: '109',
        fees: { kAppFee: 500_000, bandwidthFee: 100_000 },
      })
    expect(typeof tx.toHex()).toBe('string')
  })

  it('buildRequest() returns a plain JSON request object', () => {
    const req = new TransactionBuilder()
      .sender(SENDER)
      .transfer({ receiver: SENDER, amount: parseKLV('1') })
      .buildRequest()

    // Sanity: the request should serialize without circular references.
    expect(() => JSON.stringify(req)).not.toThrow()
  })
})
