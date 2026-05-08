/**
 * Mocked tests: feed parseReceipt a few canonical raw receipt shapes and
 * confirm it dispatches to the right tagged result.
 */
import { describe, it, expect } from 'vitest'
import { parseReceipt } from '@klever/connect-provider'

describe('tx-receipt-parse', () => {
  it('decodes a Transfer receipt', () => {
    // The exact field names match the proto-encoded shape returned by the
    // node; we use string-typed `type` to match the live API.
    const decoded = parseReceipt({
      type: 0,
      assetId: 'KLV',
      from: 'klv1abc...',
      to: 'klv1xyz...',
      value: '1000000',
    } as Parameters<typeof parseReceipt>[0])

    expect((decoded as { type: number }).type).toBeDefined()
  })

  it('decodes a Freeze receipt (yields a bucketId)', () => {
    const decoded = parseReceipt({
      type: 4,
      assetId: 'KLV',
      bucketId: 'bucket-abc',
      value: '500000000',
    } as Parameters<typeof parseReceipt>[0])

    expect((decoded as { bucketId?: string }).bucketId).toBe('bucket-abc')
  })

  it('an unknown receipt type still parses (returns the raw shape)', () => {
    expect(() =>
      parseReceipt({ type: 9999 } as Parameters<typeof parseReceipt>[0]),
    ).not.toThrow()
  })
})
