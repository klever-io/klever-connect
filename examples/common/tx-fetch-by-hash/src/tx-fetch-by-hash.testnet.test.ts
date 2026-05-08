/**
 * Live testnet test: only runs if KLV_TX_HASH is set in env, otherwise skipped.
 */
import { describe, it } from 'vitest'
import { KleverProvider, createTransactionHash, isTransactionHash } from '@klever/connect'

const HASH = process.env['KLV_TX_HASH']

const maybe = HASH ? it : it.skip

describe('tx-fetch-by-hash (live testnet)', () => {
  maybe('fetches a real testnet transaction', async () => {
    if (!HASH || !isTransactionHash(HASH)) throw new Error('KLV_TX_HASH not set or not a valid hash')
    const provider = new KleverProvider({ network: 'testnet' })
    const tx = await provider.getTransaction(createTransactionHash(HASH))
    if (!tx) throw new Error('tx not found')
  }, 30_000)
})
