import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1unfreezer000000000000000000000000000000000000000000000000'
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

describe('unfreeze (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_BUCKET_ID'] = 'bucket-hex-id'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_BUCKET_ID']
    delete process.env['KLV_KDA']
  })

  it('happy path — sends contractType 5 with kda=KLV by default', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; kda: string; bucketId: string }
        | undefined
      expect(args?.contractType).toBe(5)
      expect(args?.kda).toBe('KLV')
      expect(args?.bucketId).toBe('bucket-hex-id')
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — exits when KLV_BUCKET_ID missing', async () => {
    delete process.env['KLV_BUCKET_ID']
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
