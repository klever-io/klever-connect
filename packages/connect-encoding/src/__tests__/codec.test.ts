import { describe, it, expect } from 'vitest'
import { KleverEncoder } from '../encoder'
import { KleverDecoder } from '../decoder'

// NOTE: KleverEncoder and KleverDecoder are stubs pending protobuf implementation.
// These tests confirm the current stub contract. They will need to be rewritten
// once the real encoding logic lands.
describe('KleverEncoder (stub)', () => {
  it('should return an empty Uint8Array for any input', () => {
    const result = KleverEncoder.encode({ type: 'transfer', amount: 100 })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(0)
  })

  it('should accept null as input', () => {
    const result = KleverEncoder.encode(null)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('should accept undefined as input', () => {
    const result = KleverEncoder.encode(undefined)
    expect(result).toBeInstanceOf(Uint8Array)
  })
})

describe('KleverDecoder (stub)', () => {
  it('should return null for any input', () => {
    const result = KleverDecoder.decode(new Uint8Array([1, 2, 3]))
    expect(result).toBeNull()
  })

  it('should accept empty Uint8Array', () => {
    const result = KleverDecoder.decode(new Uint8Array())
    expect(result).toBeNull()
  })
})
