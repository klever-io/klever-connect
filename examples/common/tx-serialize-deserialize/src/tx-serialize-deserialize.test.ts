import { describe, it, expect } from 'vitest'
import {
  Transaction,
  TransactionBuilder,
  parseKLV,
  createKleverAddress,
} from '@klever/connect'

const SENDER = createKleverAddress(
  'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
)

describe('tx-serialize-deserialize', () => {
  it('toHex / fromHex round-trips byte-exact (offline build)', () => {
    const tx = new TransactionBuilder()
      .transfer({ receiver: SENDER, amount: parseKLV('0.001') })
      .buildProto({
        sender: SENDER,
        nonce: 42,
        chainId: '109',
        fees: { kAppFee: 500_000, bandwidthFee: 100_000 },
      })

    const hex = tx.toHex()
    expect(hex.length).toBeGreaterThan(0)

    const recovered = Transaction.fromHex(hex)
    expect(recovered.toHex()).toBe(hex)
  })

  it('Transaction.fromHex throws on garbage', () => {
    expect(() => Transaction.fromHex('not-hex')).toThrow()
  })
})
