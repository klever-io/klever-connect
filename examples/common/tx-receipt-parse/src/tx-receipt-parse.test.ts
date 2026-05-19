/**
 * Mocked tests: feed parseReceipt parsers a few canonical transaction shapes
 * and confirm each typed parser yields the expected result.
 *
 * `parseReceipt` is exported as an object of typed parsers, one per receipt
 * kind (transfer, freeze, unfreeze, claim, withdraw, delegate, undelegate).
 * Each parser takes a full ITransactionResponse and walks the `receipts[]`
 * array to find the matching entry.
 */
import { describe, it, expect } from 'vitest'
import { parseReceipt } from '@klever/connect-provider'

describe('tx-receipt-parse', () => {
  it('parses a Transfer receipt from a transaction response', () => {
    const decoded = parseReceipt.transfer({
      receipts: [
        {
          type: 0,
          typeString: 'Transfer',
          assetId: 'KLV',
          from: 'klv1abc...',
          to: 'klv1xyz...',
          value: '1000000',
        },
      ],
    } as Parameters<typeof parseReceipt.transfer>[0])

    expect(decoded.amount).toBe(1000000n)
  })

  it('parses a Freeze receipt (yields a bucketId)', () => {
    const decoded = parseReceipt.freeze({
      receipts: [
        {
          type: 3,
          typeString: 'Freeze',
          assetId: 'KLV',
          bucketId: 'bucket-abc',
          value: '500000000',
        },
      ],
    } as Parameters<typeof parseReceipt.freeze>[0])

    expect(decoded.bucketId).toBe('bucket-abc')
  })

  it('exposes a typed parser for each known receipt kind', () => {
    for (const kind of [
      'freeze',
      'unfreeze',
      'claim',
      'withdraw',
      'delegate',
      'undelegate',
      'transfer',
    ] as const) {
      expect(typeof parseReceipt[kind]).toBe('function')
    }
  })
})
