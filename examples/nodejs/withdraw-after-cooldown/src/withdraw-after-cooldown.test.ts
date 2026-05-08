import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1withdrawer000000000000000000000000000000000000000000000000'
    constructor(_p: unknown, _k: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    sendTransaction = sendTxMock
  }
  class MockKleverProvider {
    constructor(_o: unknown) {}
  }
  return { KleverProvider: MockKleverProvider, NodeWallet: MockNodeWallet }
})

describe('withdraw-after-cooldown (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA']
    delete process.env['KLV_WITHDRAW_TYPE']
  })

  it('happy path — defaults to KLV / type 0', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; kda: string; withdrawType: number }
        | undefined
      expect(args?.contractType).toBe(8)
      expect(args?.kda).toBe('KLV')
      expect(args?.withdrawType).toBe(0)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — KDA pool withdraw (type 1) forwards kda=MTT-ABCD', async () => {
    process.env['KLV_KDA'] = 'MTT-ABCD'
    process.env['KLV_WITHDRAW_TYPE'] = '1'
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; kda: string; withdrawType: number }
        | undefined
      expect(args?.kda).toBe('MTT-ABCD')
      expect(args?.withdrawType).toBe(1)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
