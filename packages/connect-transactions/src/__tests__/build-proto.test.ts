import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { ValidationError } from '@klever/connect-core'
import type { ContractRequestData } from '@klever/connect-provider'
import { SmartContract, TransferContract, base64Decode } from '@klever/connect-encoding'
import { TransactionBuilder } from '../builder'
import { OFFLINE_CONTRACT_TYPES, encodeContract } from '../contract-encoder'

interface Fixture {
  name: string
  request: {
    contracts: ContractRequestData[]
    sender: string
    nonce: number
    data?: string[]
    /** The node's name for the permission ID in /transaction/send */
    permID?: number
  }
  rawData: {
    KAppFee?: number
    BandwidthFee?: number
    Version: number
    ChainID: string
    Contract: { Parameter: { value?: string } }[]
  }
  nodeHash: string
  mapOrder?: 'differs'
}

const fixtures = (
  JSON.parse(
    readFileSync(new URL('./fixtures/node-built-transactions.json', import.meta.url), 'utf8'),
  ) as { cases: Fixture[] }
).cases

const SENDER = 'klv1q8qujd7amzjqglz2mrc8emh5vjqwck7qmapc4la28nwmeqtjsnfq7pemdj'
const RECEIVER = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
const SC_ADDRESS = 'klv1qqqqqqqqqqqqqpgqga892hrrdfchslux3k2fhg4fkzmma3wv60dq77ccga'

const decoder = new TextDecoder()

/** Numbers and base64 strings, so decoded messages compare with toEqual. */
const plain = { longs: Number, bytes: String } as const

/** Rebuild a fixture's transaction offline with the same inputs the node had. */
function buildOffline(f: Fixture) {
  const builder = TransactionBuilder.create()
  for (const contract of f.request.contracts) builder.addContract(contract)
  if (f.request.data) {
    // buildRequest sends smart-contract data base64-encoded; buildProto takes the strings
    builder.data(f.request.data.map((d) => decoder.decode(base64Decode(d))))
  }
  return builder.buildProto({
    sender: f.request.sender,
    nonce: f.request.nonce,
    chainId: decoder.decode(base64Decode(f.rawData.ChainID)),
    version: f.rawData.Version,
    ...(f.request.permID !== undefined && { permissionId: f.request.permID }),
    fees: { kAppFee: f.rawData.KAppFee ?? 0, bandwidthFee: f.rawData.BandwidthFee ?? 0 },
  })
}

describe('buildProto() matches transactions built by the node', () => {
  it('should have a fixture for every contract type it encodes', () => {
    const types = new Set(fixtures.flatMap((f) => f.request.contracts.map((c) => c.contractType)))
    expect([...types].sort((a, b) => a - b)).toEqual([...OFFLINE_CONTRACT_TYPES])
  })

  it.each(fixtures.filter((f) => !f.mapOrder).map((f) => [f.name, f] as const))(
    '%s: same RawData and the hash the node computed',
    (_, f) => {
      const tx = buildOffline(f)

      expect(tx.toJSON()['RawData']).toEqual(f.rawData)
      expect(tx.getHash()).toBe(f.nodeHash)
    },
  )

  // Go writes a map in random order, so two call-value assets can come out
  // either way round. The contract must still decode to the same values.
  it.each(fixtures.filter((f) => f.mapOrder).map((f) => [f.name, f] as const))(
    '%s: same contract once decoded',
    (_, f) => {
      const tx = buildOffline(f)
      const raw = tx.toJSON()['RawData'] as Fixture['rawData']
      const decode = (value = '') =>
        SmartContract.toObject(SmartContract.decode(base64Decode(value)), plain)

      expect({ ...raw, Contract: undefined }).toEqual({ ...f.rawData, Contract: undefined })
      expect(decode(raw.Contract[0]!.Parameter.value)).toEqual(
        decode(f.rawData.Contract[0]!.Parameter.value),
      )
    },
  )
})

describe('buildProto() encoding', () => {
  const base = { sender: SENDER, nonce: 1, chainId: '108' }

  it('should leave out fields that are 0, as the node does', () => {
    const tx = TransactionBuilder.create()
      .transfer({ receiver: RECEIVER, amount: 1 })
      .buildProto({ ...base, nonce: 0, permissionId: 0, fees: { kAppFee: 0, bandwidthFee: 0 } })

    const raw = tx.toJSON()['RawData'] as { [k: string]: unknown }
    expect(Object.keys(raw).sort()).toEqual(['ChainID', 'Contract', 'Sender', 'Version'])
  })

  it('should set Version 1 by default and accept another version', () => {
    const builder = TransactionBuilder.create().transfer({ receiver: RECEIVER, amount: 1 })

    expect(builder.buildProto(base).RawData?.Version).toBe(1)
    expect(builder.buildProto({ ...base, version: 2 }).RawData?.Version).toBe(2)
  })

  it('should encode the transfer fields and the type URL the node checks', () => {
    const tx = TransactionBuilder.create()
      .transfer({
        receiver: RECEIVER,
        amount: '2500',
        kda: 'KFI',
        kdaRoyalties: 3n,
        klvRoyalties: 4,
      })
      .buildProto(base)
    const parameter = tx.RawData!.Contract![0]!.Parameter!

    expect(parameter.type_url).toBe('type.googleapis.com/proto.TransferContract')
    expect(TransferContract.toObject(TransferContract.decode(parameter.value!), plain)).toEqual({
      ToAddress: expect.any(String),
      AssetID: 'S0ZJ', // base64 of 'KFI'
      Amount: 2500,
      KDARoyalties: 3,
      KLVRoyalties: 4,
    })
  })

  it('should keep every contract, in order', () => {
    const tx = TransactionBuilder.create()
      .transfer({ receiver: RECEIVER, amount: 1 })
      .freeze({ amount: 1000, kda: 'KFI' })
      .smartContract({ scType: 0, address: SC_ADDRESS as never })
      .buildProto(base)

    expect(tx.RawData?.Contract?.map((c) => c.Type ?? 0)).toEqual([0, 4, 63])
  })

  it('should encode a deploy without an address and a call value by asset', () => {
    const tx = TransactionBuilder.create()
      .smartContract({ scType: 1, callValue: { KLV: 10n } })
      .buildProto(base)
    const sc = SmartContract.toObject(
      SmartContract.decode(tx.RawData!.Contract![0]!.Parameter!.value!),
      plain,
    )

    expect(sc).toEqual({ Type: 1, CallValue: { KLV: { Amount: 10 } } })
  })

  it('should leave out an empty contract value, as the node does', () => {
    const tx = TransactionBuilder.create().claim({ claimType: 0 }).buildProto(base)

    expect(tx.RawData?.Contract?.[0]?.Parameter).toEqual({
      type_url: 'type.googleapis.com/proto.ClaimContract',
    })
  })

  it('should reject smart contract types the node does not define', () => {
    const builder = TransactionBuilder.create()
      .smartContract({ scType: 2, address: SC_ADDRESS as never })
      .data(['upgrade'])

    expect(() => builder.buildProto(base)).toThrow(/Smart contract type 2 is not supported/)
  })

  it.each([
    ['hex', '0x10'],
    ['binary', '0b1'],
    ['padded', ' 10 '],
    ['fractional', 1.5],
    ['unsafe number', 1e18],
  ])('should reject a %s amount in transfer() and freeze()', (_, amount) => {
    const builder = TransactionBuilder.create()

    expect(() => builder.transfer({ receiver: RECEIVER, amount: amount as never })).toThrow(
      ValidationError,
    )
    expect(() => builder.freeze({ amount: amount as never })).toThrow(ValidationError)
  })

  it('should reject contract types it cannot encode instead of dropping them', () => {
    const builder = TransactionBuilder.create().createAsset({
      type: 0,
      name: 'Token',
      ticker: 'TKN',
      ownerAddress: SENDER,
      precision: 6,
      maxSupply: 1000,
    })

    expect(() => builder.buildProto(base)).toThrow(ValidationError)
    expect(() => builder.buildProto(base)).toThrow(/Contract type 1 cannot be built offline/)
  })

  it('should reject a contract type added directly that it cannot encode', () => {
    const builder = TransactionBuilder.create().addContract({
      contractType: 12,
      name: 'alice',
    } as unknown as ContractRequestData)

    expect(() => builder.buildProto(base)).toThrow(/Contract type 12 cannot be built offline/)
  })

  // The builder methods already reject some of these; the encoder must too,
  // since addContract passes unknown types and raw values straight through.
  it.each([
    ['a negative amount', { contractType: 4, amount: -1 }],
    ['an amount above 2^53', { contractType: 4, amount: 2n ** 53n }],
    ['a fractional amount', { contractType: 4, amount: 1.5 }],
    ['a hex amount', { contractType: 4, amount: '0x10' }],
    [
      'a call value above 2^53',
      { contractType: 63, scType: 1, callValue: { KLV: '9007199254740993' } },
    ],
    ['a call value that is not a map', { contractType: 63, scType: 1, callValue: [1] }],
    ['an invalid address', { contractType: 0, receiver: 'klv1nope', amount: 1 }],
  ])('should reject %s', (_, contract) => {
    expect(() => encodeContract(contract as unknown as ContractRequestData)).toThrow(
      ValidationError,
    )
  })

  it.each([
    ['delegate', { contractType: 6, receiver: RECEIVER, bucketId: 'zz' }],
    ['undelegate', { contractType: 7, bucketId: 'abc' }],
    ['a market claim', { contractType: 9, claimType: 2, id: 'order-1' }],
  ])('should reject a non-hex ID for %s, as the node does', (_, contract) => {
    const builder = TransactionBuilder.create().addContract(contract as ContractRequestData)

    expect(() => builder.buildProto(base)).toThrow(/must be a hex string/)
  })

  it('should require a bucket ID for unfreeze and delegate, as the node does', () => {
    expect(() => TransactionBuilder.create().unfreeze({ kda: 'KFI' }).buildProto(base)).toThrow(
      'bucketId is required',
    )
    expect(() =>
      TransactionBuilder.create().delegate({ receiver: RECEIVER }).buildProto(base),
    ).toThrow('bucketId is required')
  })

  it.each([
    ['nonce', { nonce: -1 }],
    ['fees', { fees: { kAppFee: 1.5, bandwidthFee: 0 } }],
    ['version', { version: -1 }],
    ['version above uint32', { version: 2 ** 32 }],
    ['fractional permissionId', { permissionId: 1.5 }],
    ['permissionId above int32', { permissionId: 2 ** 31 }],
    ['kdaFee amount', { kdaFee: { kda: 'KFI', amount: '1e3' } }],
  ])('should reject an invalid %s', (_, options) => {
    const builder = TransactionBuilder.create().transfer({ receiver: RECEIVER, amount: 1 })

    expect(() => builder.buildProto({ ...base, ...options })).toThrow(ValidationError)
  })
})
