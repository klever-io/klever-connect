import { readFileSync } from 'node:fs'
import { blake2b } from '@noble/hashes/blake2'
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
      Contract: [{ Type: 4, Parameter: { type_url: 't', value: new Uint8Array([1]) } }],
    },
  })

  it('should decode protobuf bytes into the node format', () => {
    expect(transactionBytesToJSON(Transaction.encode(tx).finish())).toEqual({
      RawData: {
        Nonce: 7,
        Sender: 'AQID',
        Contract: [{ Type: 4, Parameter: { type_url: 't', value: 'AQ==' } }],
      },
    })
  })

  it('should reject bytes that are not a transaction', () => {
    expect(() => transactionBytesToJSON(new Uint8Array([0xff, 0xff, 0xff]))).toThrow(
      'Bytes are not a valid encoded transaction',
    )
  })

  // Protobuf helpers to build bytes that protobuf.js would never write itself
  const varint = (n: number): number[] => {
    const out: number[] = []
    while (n >= 0x80) {
      out.push((n % 0x80) | 0x80)
      n = Math.floor(n / 0x80)
    }
    out.push(n)
    return out
  }
  const lengthDelimited = (field: number, value: Uint8Array): Uint8Array =>
    new Uint8Array([...varint(field * 8 + 2), ...varint(value.length), ...value])
  // Field 99 as a varint, which this SDK's proto doesn't define
  const unknownField = new Uint8Array([...varint(99 * 8), 1])
  const concat = (...parts: Uint8Array[]): Uint8Array =>
    new Uint8Array(parts.flatMap((part) => [...part]))
  const rawBytes = Transaction.Raw.encode(tx.RawData!).finish()
  const signature = lengthDelimited(2, new Uint8Array(64).fill(7))

  it('should accept every transaction the node built, unchanged', () => {
    const fixtures = JSON.parse(
      readFileSync(
        new URL(
          '../../../connect-transactions/src/__tests__/fixtures/node-built-transactions.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ) as { cases: { name: string; rawData: object; nodeHash: string }[] }
    expect(fixtures.cases.length).toBeGreaterThan(0)

    for (const f of fixtures.cases) {
      const raw = Transaction.Raw.encode(Transaction.Raw.fromObject(f.rawData)).finish()
      // The node's hash of these bytes proves they are the bytes the node built
      expect(Buffer.from(blake2b(raw, { dkLen: 32 })).toString('hex'), f.name).toBe(f.nodeHash)

      const json = transactionBytesToJSON(concat(lengthDelimited(1, raw), signature))
      expect(json['RawData'], f.name).toEqual(f.rawData)
    }
  })

  it('should reject RawData with a field this SDK does not know', () => {
    const bytes = concat(lengthDelimited(1, concat(rawBytes, unknownField)), signature)

    expect(() => transactionBytesToJSON(bytes)).toThrow('would not reach the node as it was signed')
  })

  it('should reject an unknown field nested inside RawData', () => {
    // KDAFee (RawData field 17) with KDA = [1], Amount = 5, then field 99
    const kdaFee = concat(lengthDelimited(1, new Uint8Array([1])), new Uint8Array([0x10, 5]))
    const known = lengthDelimited(17, kdaFee)
    const unknown = lengthDelimited(17, concat(kdaFee, unknownField))

    expect(() => transactionBytesToJSON(lengthDelimited(1, known))).not.toThrow()
    expect(() => transactionBytesToJSON(lengthDelimited(1, unknown))).toThrow(
      'would not reach the node as it was signed',
    )
  })

  it('should accept an unknown field outside RawData, which is not signed', () => {
    const bytes = concat(lengthDelimited(1, rawBytes), signature, unknownField)

    expect(transactionBytesToJSON(bytes)['RawData']).toEqual({
      Nonce: 7,
      Sender: 'AQID',
      Contract: [{ Type: 4, Parameter: { type_url: 't', value: 'AQ==' } }],
    })
  })

  it('should reject a zero value written explicitly, which the node leaves out', () => {
    // Contract Type 0 (Transfer) encoded as field 1 = 0: Go's encoding omits it,
    // so the node would hash different bytes than were signed
    const explicitZero = Transaction.Raw.encode(
      Transaction.Raw.fromObject({
        Nonce: 7,
        Contract: [{ Type: 0, Parameter: { type_url: 't' } }],
      }),
    ).finish()
    const implicitZero = Transaction.Raw.encode(
      Transaction.Raw.fromObject({ Nonce: 7, Contract: [{ Parameter: { type_url: 't' } }] }),
    ).finish()

    expect(() => transactionBytesToJSON(lengthDelimited(1, explicitZero))).toThrow(
      'would not reach the node as it was signed',
    )
    expect(() => transactionBytesToJSON(lengthDelimited(1, implicitZero))).not.toThrow()
  })

  it('should accept an unknown group outside RawData', () => {
    // Field 99 as an empty group: start tag 99/3, end tag 99/4
    const group = new Uint8Array([...varint(99 * 8 + 3), ...varint(99 * 8 + 4)])

    expect(() => transactionBytesToJSON(concat(lengthDelimited(1, rawBytes), group))).not.toThrow()
  })

  it('should reject a RawData length past the end of the input', () => {
    // Field 1 declaring 2^32 bytes with none following
    expect(() =>
      transactionBytesToJSON(new Uint8Array([0x0a, 0x80, 0x80, 0x80, 0x80, 0x10])),
    ).toThrow()
  })

  it.each([
    // RawData with Nonce 1, then field 1 as varints: the generated decoder would
    // read the last one as a RawData with Nonce 7
    ['field 1 with the wrong wire type', '0a02080108020807'],
    // Group 99 opened and group 100 closed
    ['a group end tag that does not match its start', '0a009b06a406'],
    // RawData declares 1 byte, but its Sender reads 17 bytes past it
    ['RawData whose content runs past its length', '0a011212' + '11' + '00'.repeat(17)],
  ])('should reject %s', (_, hex) => {
    const bytes = new Uint8Array(Buffer.from(hex, 'hex'))

    expect(() => transactionBytesToJSON(bytes)).toThrow(
      /not a valid encoded transaction|would not reach the node/,
    )
  })

  it('should reject RawData that appears twice', () => {
    const bytes = concat(lengthDelimited(1, rawBytes), lengthDelimited(1, rawBytes))

    expect(() => transactionBytesToJSON(bytes)).toThrow('would not reach the node as it was signed')
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
