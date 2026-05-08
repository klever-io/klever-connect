import { describe, it, expect } from 'vitest'
import { KleverProvider, createTransactionHash, isTransactionHash } from '@klever/connect'
import { parseReceipt } from '@klever/connect-provider'

const HASH = process.env['KLV_TX_HASH']
const maybe = HASH && isTransactionHash(HASH) ? it : it.skip

describe('tx-receipt-parse (live testnet)', () => {
  maybe('decodes every receipt on a real tx', async () => {
    if (!HASH || !isTransactionHash(HASH)) throw new Error('KLV_TX_HASH unset')
    const provider = new KleverProvider({ network: 'testnet' })
    const r = await provider.getTransactionReceipt(createTransactionHash(HASH))
    const raw = (r as { receipts?: unknown[] }).receipts ?? []
    for (const item of raw) {
      const parsed = parseReceipt(item as Parameters<typeof parseReceipt>[0])
      expect(parsed).toBeDefined()
    }
  }, 30_000)
})
