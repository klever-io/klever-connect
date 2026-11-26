import { describe, it, expect } from 'vitest'
import {
  normalizeTransactionJSON,
  transactionBytesToJSON,
  transactionObjectToJSON,
} from '../transaction-json'
import { Transaction } from '../proto'

describe('normalizeTransactionJSON', () => {
  it('should convert int64 strings, including nested KDAFee.Amount, to numbers', () => {
    const json = normalizeTransactionJSON({
      GasLimit: '21000',
      RawData: {
        Nonce: '42',
        KAppFee: '500000',
        BandwidthFee: '100000',
        PermissionID: 2,
        KDAFee: { KDA: 'S0ZJ', Amount: '1234567' },
      },
    })

    expect(json).toEqual({
      GasLimit: 21000,
      RawData: {
        Nonce: 42,
        KAppFee: 500000,
        BandwidthFee: 100000,
        PermissionID: 2,
        KDAFee: { KDA: 'S0ZJ', Amount: 1234567 },
      },
    })
  })

  it('should convert contract type names to their enum numbers', () => {
    const json = normalizeTransactionJSON({
      RawData: {
        Contract: [{ Type: 'TransferContractType' }, { Type: 'SmartContractType' }, { Type: 0 }],
      },
    })

    const contracts = (json['RawData'] as { Contract: { Type: unknown }[] }).Contract
    expect(contracts.map((c) => c.Type)).toEqual([0, 63, 0])
  })

  it('should leave an unknown contract type name unchanged', () => {
    const json = normalizeTransactionJSON({ RawData: { Contract: [{ Type: 'NotAType' }] } })
    expect((json['RawData'] as { Contract: { Type: unknown }[] }).Contract[0]?.Type).toBe(
      'NotAType',
    )
  })

  it('should convert top-level GasMultiplier and Block to numbers', () => {
    expect(normalizeTransactionJSON({ GasMultiplier: '2', Block: '1000' })).toEqual({
      GasMultiplier: 2,
      Block: 1000,
    })
  })

  // Number() would send 'abc' as null, '' as 0, '0x10' as 16, and round the last.
  const malformed = ['-1', '1.5', 'abc', '', '0x10', ' 7', '1e3', '9007199254740993']
  const fields: [string, (v: string) => { [k: string]: unknown }][] = [
    ['GasLimit', (v) => ({ GasLimit: v })],
    ['GasMultiplier', (v) => ({ GasMultiplier: v })],
    ['Block', (v) => ({ Block: v })],
    ['Nonce', (v) => ({ RawData: { Nonce: v } })],
    ['KAppFee', (v) => ({ RawData: { KAppFee: v } })],
    ['BandwidthFee', (v) => ({ RawData: { BandwidthFee: v } })],
    ['KDAFee.Amount', (v) => ({ RawData: { KDAFee: { Amount: v } } })],
  ]

  it.each(fields.flatMap(([name, build]) => malformed.map((v) => [name, v, build] as const)))(
    'should reject %s %j',
    (name, value, build) => {
      expect(() => normalizeTransactionJSON(build(value))).toThrow(`Invalid ${name} value`)
    },
  )

  it('should not put the rejected value in the error', () => {
    expect(() => normalizeTransactionJSON({ RawData: { Nonce: 'secret-ish' } })).toThrow(
      /^Invalid Nonce value$/,
    )
  })

  it('should accept the largest safe integer', () => {
    const max = String(Number.MAX_SAFE_INTEGER)
    expect(normalizeTransactionJSON({ RawData: { Nonce: max } })).toEqual({
      RawData: { Nonce: Number.MAX_SAFE_INTEGER },
    })
  })
})

describe('transactionBytesToJSON', () => {
  const tx = Transaction.fromObject({
    RawData: {
      Nonce: 7,
      Sender: new Uint8Array([1, 2, 3]),
      Contract: [{ Type: 0, Parameter: { type_url: 't', value: new Uint8Array([1]) } }],
    },
  })

  it('should decode protobuf bytes into the node format', () => {
    expect(transactionBytesToJSON(Transaction.encode(tx).finish())).toEqual({
      RawData: {
        Nonce: 7,
        Sender: 'AQID',
        Contract: [{ Type: 0, Parameter: { type_url: 't', value: 'AQ==' } }],
      },
    })
  })

  it('should reject bytes that are not a transaction', () => {
    expect(() => transactionBytesToJSON(new Uint8Array([0xff, 0xff, 0xff]))).toThrow(
      'Bytes are not a valid encoded transaction',
    )
  })

  it('should reject a transaction without RawData', () => {
    // Field 2 (Signature) with an empty value: valid protobuf, no RawData.
    expect(() => transactionBytesToJSON(new Uint8Array([0x12, 0x00]))).toThrow(
      'Encoded transaction has no RawData',
    )
  })
})

describe('transactionObjectToJSON', () => {
  it('should convert a proto-shaped object into the node format', () => {
    expect(
      transactionObjectToJSON({
        RawData: { Nonce: 7, Sender: new Uint8Array([1, 2, 3]) },
        Signature: [new Uint8Array([9])],
      }),
    ).toEqual({ RawData: { Nonce: 7, Sender: 'AQID' }, Signature: ['CQ=='] })
  })

  it('should reject an object without RawData', () => {
    expect(() => transactionObjectToJSON({ Signature: [new Uint8Array([9])] })).toThrow(
      'Transaction object has no RawData',
    )
  })
})
