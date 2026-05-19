import { describe, it, expect } from 'vitest'
import { Contract, KleverProvider, createKleverAddress, isValidAddress } from '@klever/connect'
import counterAbi from './counter-abi.json' with { type: 'json' }

const ADDR = process.env['COUNTER_ADDRESS']
const maybe = ADDR && isValidAddress(ADDR) ? it : it.skip

describe('sc-query-readonly (live testnet)', () => {
  maybe('queries getValue on a deployed counter', async () => {
    if (!ADDR) throw new Error('COUNTER_ADDRESS not set')
    const provider = new KleverProvider({ network: 'testnet' })
    const contract = new Contract(createKleverAddress(ADDR), counterAbi, provider)

    const value = await contract.call('getValue')
    expect(value).toBeDefined()
    // Counter values are u64 -> non-negative.
    expect(BigInt(value as string | number | bigint) >= 0n).toBe(true)
  }, 30_000)
})
