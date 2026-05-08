/**
 * Mocked test: stub `provider.queryContract` so the readonly call returns a
 * canned value, then walk the Contract path.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@klever/connect', async () => {
  const actual = await vi.importActual<typeof import('@klever/connect')>('@klever/connect')

  class MockProvider {
    constructor(public readonly cfg: unknown) {}
    async queryContract(_params: unknown) {
      // Match the IContractQueryResult shape — returnData is base64-encoded
      // bytes. For u64 = 42, the big-endian bytes are 0x000000000000002a,
      // base64 = AAAAAAAAACo=.
      return {
        returnData: ['AAAAAAAAACo='],
        returnCode: 'Ok',
        returnMessage: '',
      }
    }
  }
  return { ...actual, KleverProvider: MockProvider }
})

import { Contract, KleverProvider, createKleverAddress } from '@klever/connect'
import counterAbi from './counter-abi.json' with { type: 'json' }

describe('sc-query-readonly (mocked)', () => {
  it('decodes the canned u64 return', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const addr = createKleverAddress(
      'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
    )
    const contract = new Contract(addr, counterAbi, provider)
    const value = await contract.call('getValue')

    // The SDK decodes u64 to either a number, bigint, or string depending on
    // version — check it's "value-like" rather than asserting a specific type.
    expect(value).toBeDefined()
    expect(BigInt(value as string | number | bigint)).toBe(42n)
  })
})
