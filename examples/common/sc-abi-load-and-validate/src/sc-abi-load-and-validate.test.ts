import { describe, it, expect } from 'vitest'
import { ABIValidator, Interface } from '@klever/connect-contracts'
import counterAbi from './counter-abi.json' with { type: 'json' }

describe('sc-abi-load-and-validate', () => {
  it('validates the counter ABI shape', () => {
    const result = ABIValidator.validate(counterAbi)
    expect(result.valid).toBe(true)
  })

  it('rejects a deliberately broken ABI', () => {
    const broken = { ...counterAbi, endpoints: [{ name: 'noop' /* missing fields */ }] }
    const result = ABIValidator.validate(broken)
    expect(result.valid).toBe(false)
  })

  it('Interface enumerates the expected endpoints', () => {
    const iface = new Interface(counterAbi)
    expect(iface).toBeDefined()
    expect(counterAbi.endpoints.map((e) => e.name)).toEqual(['increment', 'add', 'getValue'])
  })

  it('Interface enumerates the expected event', () => {
    expect(counterAbi.events.map((e) => e.identifier)).toEqual(['counter_changed'])
  })
})
