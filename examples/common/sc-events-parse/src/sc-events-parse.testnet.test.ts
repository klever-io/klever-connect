import { describe, it, expect } from 'vitest'
import {
  Contract,
  KleverProvider,
  createKleverAddress,
  isValidAddress,
  createTransactionHash,
  isTransactionHash,
} from '@klever/connect'
import counterAbi from './counter-abi.json' with { type: 'json' }

const ADDR = process.env['COUNTER_ADDRESS']
const HASH = process.env['KLV_TX_HASH']

const ready =
  ADDR && isValidAddress(ADDR) && HASH && isTransactionHash(HASH)
const maybe = ready ? it : it.skip

describe('sc-events-parse (live testnet)', () => {
  maybe('decodes counter_changed events from a real receipt', async () => {
    if (!ADDR || !HASH) throw new Error('env not set')

    const provider = new KleverProvider({ network: 'testnet' })
    const contract = new Contract(createKleverAddress(ADDR), counterAbi, provider)

    const receipt = await provider.getTransactionReceipt(createTransactionHash(HASH))
    const logs = (receipt as { logs?: unknown[] }).logs ?? []
    const events = contract.parseEvents(logs as Parameters<typeof contract.parseEvents>[0])

    expect(Array.isArray(events)).toBe(true)
  }, 30_000)
})
