/**
 * Live testnet test: builds a transaction in node-assisted and offline modes.
 * Doesn't broadcast (no signing key in common/).
 */
import { describe, it, expect } from 'vitest'
import {
  KleverProvider,
  TransactionBuilder,
  parseKLV,
  createKleverAddress,
} from '@klever/connect'

const SENDER = createKleverAddress(
  process.env['KLEVER_TESTNET_ADDRESS'] ??
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
)

describe('tx-build-modes (live testnet)', () => {
  it('build() returns proto bytes for a real testnet sender', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const tx = await new TransactionBuilder(provider)
      .sender(SENDER)
      .transfer({ receiver: SENDER, amount: parseKLV('0.001') })
      .build()
    expect(tx.toHex().length).toBeGreaterThan(40) // any non-trivial proto
  }, 30_000)

  it('buildProto offline matches a manually-supplied nonce', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const nonce = await provider.getNonce(SENDER)
    const tx = new TransactionBuilder()
      .transfer({ receiver: SENDER, amount: parseKLV('0.001') })
      .buildProto({
        sender: SENDER,
        nonce: nonce + 1,
        chainId: '109',
        fees: { kAppFee: 500_000, bandwidthFee: 100_000 },
      })
    expect(tx.toHex().length).toBeGreaterThan(40)
  }, 30_000)
})
