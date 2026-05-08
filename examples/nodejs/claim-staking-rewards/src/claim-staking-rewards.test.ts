import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1claimer000000000000000000000000000000000000000000000000000'
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

describe('claim-staking-rewards (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_CLAIM_TYPE'] = '0'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_CLAIM_TYPE']
    delete process.env['KLV_CLAIM_KDA']
  })

  it('happy path — APR claim sends contractType 9, claimType 0, no id', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; claimType: number; id?: string }
        | undefined
      expect(args?.contractType).toBe(9)
      expect(args?.claimType).toBe(0)
      expect(args?.id).toBeUndefined()
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — FPR claim (type 3) requires KLV_CLAIM_KDA', async () => {
    process.env['KLV_CLAIM_TYPE'] = '3'
    delete process.env['KLV_CLAIM_KDA']
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit')
    }) as never)
    try {
      await expect(import('./index.ts')).rejects.toThrow('exit')
      expect(exitSpy).toHaveBeenCalledWith(1)
    } finally {
      errSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
