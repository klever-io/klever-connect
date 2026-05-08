import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1freezer000000000000000000000000000000000000000000000000000'
    constructor(_p: unknown, _k: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    sendTransaction = sendTxMock
  }
  class MockKleverProvider {
    constructor(_o: unknown) {}
  }
  return {
    KleverProvider: MockKleverProvider,
    NodeWallet: MockNodeWallet,
    parseKLV: (s: string) => BigInt(Math.round(Number(s) * 1_000_000)),
  }
})

describe('freeze-for-staking (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_FREEZE_AMOUNT'] = '100'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_FREEZE_AMOUNT']
    delete process.env['KLV_FREEZE_KDA']
  })

  it('happy path — native KLV freeze sends contractType 4 with parsed amount', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      expect(sendTxMock).toHaveBeenCalledTimes(1)
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; amount: bigint; kda?: string }
        | undefined
      expect(args?.contractType).toBe(4)
      expect(args?.amount).toBe(100_000_000n)
      expect(args?.kda).toBeUndefined()
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — freeze a KDA passes the kda field', async () => {
    process.env['KLV_FREEZE_KDA'] = 'MTT-ABCD'
    process.env['KLV_FREEZE_AMOUNT'] = '500000'
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; amount: bigint; kda?: string }
        | undefined
      expect(args?.contractType).toBe(4)
      expect(args?.kda).toBe('MTT-ABCD')
      expect(args?.amount).toBe(500_000n)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
