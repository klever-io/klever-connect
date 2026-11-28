import { describe, it, expect, vi } from 'vitest'
import { KleverProvider } from '@klever/connect-provider'
import { Transaction } from '../transaction'

/**
 * Every format `sendRawTransaction` accepts must reach the node as the same
 * body as the Transaction object itself, the path that already worked.
 */
describe('Broadcasting a Transaction in each format', () => {
  const tx = new Transaction({
    RawData: {
      Nonce: 42,
      Sender: new Uint8Array(32).fill(1),
      // The transfer leaves its Type 0 out, as buildProto() and the node do: an
      // explicit zero isn't what the node hashes, so hex and bytes are refused
      Contract: [
        {
          Parameter: {
            type_url: 'type.googleapis.com/proto.TransferContract',
            value: new Uint8Array([10, 3, 75, 76, 86]),
          },
        },
        {
          Type: 63,
          Parameter: {
            type_url: 'type.googleapis.com/proto.SmartContract',
            value: new Uint8Array([9, 8, 7]),
          },
        },
      ],
      PermissionID: 2,
      Data: [new Uint8Array([1, 2])],
      KAppFee: 500000,
      BandwidthFee: 100000,
      ChainID: new Uint8Array([49, 48, 57]),
      KDAFee: { KDA: new Uint8Array([75, 70, 73]), Amount: 1234567 },
    },
    Signature: [new Uint8Array(64).fill(7)],
  })

  /** Broadcast `input` and return the transaction body as it goes over the wire. */
  async function sentBody(input: unknown): Promise<{ [k: string]: unknown }> {
    const provider = new KleverProvider('testnet')
    const post = vi.fn().mockResolvedValue({ data: { txsHashes: ['hash'] } })
    // @ts-expect-error - accessing private property for testing
    provider.nodeClient.post = post

    await provider.sendRawTransaction(input)

    const body = JSON.parse(JSON.stringify(post.mock.calls[0]?.[1])) as {
      txs: { [k: string]: unknown }[]
    }
    return body.txs[0] as { [k: string]: unknown }
  }

  it.each([
    ['tx.toHex()', () => tx.toHex()],
    ['0x + tx.toHex()', () => '0x' + tx.toHex()],
    ['tx.toBytes()', () => tx.toBytes()],
    ['tx.toJSON()', () => tx.toJSON()],
    ['JSON.stringify(tx)', () => JSON.stringify(tx)],
  ])('should send %s as the same body as the Transaction object', async (_, input) => {
    const fromObject = await sentBody(tx)
    // `hash` is a client-side convenience field the node ignores, and it is not
    // part of the encoded bytes, so hex and bytes cannot carry it.
    delete fromObject['hash']

    const body = await sentBody(input())
    delete body['hash']

    expect(body).toEqual(fromObject)
  })

  it('should keep numeric int64 fields and contract types in the body', async () => {
    const body = await sentBody(tx.toHex())
    const rawData = body['RawData'] as { [k: string]: unknown }

    expect(rawData['Nonce']).toBe(42)
    expect(rawData['KAppFee']).toBe(500000)
    expect((rawData['KDAFee'] as { [k: string]: unknown })['Amount']).toBe(1234567)
    expect((rawData['Contract'] as { Type?: unknown }[]).map((c) => c.Type)).toEqual([
      undefined,
      63,
    ])
  })
})
