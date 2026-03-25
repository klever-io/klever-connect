import { describe, it, expect, vi } from 'vitest'
import { Klever } from '../klever'

vi.mock('@klever/connect-provider', async () => {
  const actual = await vi.importActual('@klever/connect-provider')
  return {
    ...actual,
    KleverProvider: vi.fn().mockImplementation(() => ({
      getBalance: vi.fn().mockResolvedValue(BigInt(5000000)),
    })),
  }
})

describe('Klever', () => {
  it('should create instance with network option', () => {
    const klever = new Klever({ network: 'mainnet' })
    expect(klever).toBeDefined()
  })

  it('should get balance for an address', async () => {
    const klever = new Klever({ network: 'mainnet' })
    const balance = await klever.getBalance(
      'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
    )
    expect(balance).toBe(BigInt(5000000))
  })
})
