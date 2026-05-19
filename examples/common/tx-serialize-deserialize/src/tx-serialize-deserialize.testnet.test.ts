import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  Transaction,
  TransactionBuilder,
  parseKLV,
  createKleverAddress,
} from '@klever/connect'

const SENDER = createKleverAddress(
  process.env['KLEVER_TESTNET_ADDRESS'] ??
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
)

describe('tx-serialize-deserialize (live testnet)', () => {
  it('node-assisted build produces a hex that round-trips', async () => {
    const provider = new KleverProvider({ network: 'testnet' })

    const tx = await new TransactionBuilder(provider)
      .sender(SENDER)
      .transfer({ receiver: SENDER, amount: parseKLV('0.001') })
      .build()

    const hex = tx.toHex()
    const recovered = Transaction.fromHex(hex)
    expect(recovered.toHex()).toBe(hex)
  }, 30_000)
})
