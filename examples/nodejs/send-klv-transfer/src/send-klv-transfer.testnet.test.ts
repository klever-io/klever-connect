/**
 * Live testnet variant of send-klv-transfer.
 *
 * Requires a funded sender (`KLV_PRIVATE_KEY`) AND `RUN_TESTNET=1` to opt in.
 * Sends 0.000001 KLV (1 smallest unit) to itself to keep cost trivial.
 */

import { describe, expect, it } from 'vitest'

import { KleverProvider, NodeWallet, isValidAddress } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'
const KEY = process.env['KLV_PRIVATE_KEY'] ?? ''

describe.skipIf(!RUN_TESTNET || !KEY)('send-klv-transfer (testnet)', () => {
  it('self-sends 1 unit and gets a tx hash back', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const wallet = new NodeWallet(provider, KEY)
    await wallet.connect()
    expect(isValidAddress(wallet.address)).toBe(true)
    try {
      const result = await wallet.transfer({ receiver: wallet.address, amount: 1n })
      expect(typeof result.hash).toBe('string')
      expect(result.hash.length).toBeGreaterThan(0)
    } finally {
      await wallet.disconnect(true)
    }
  }, 60_000)
})
