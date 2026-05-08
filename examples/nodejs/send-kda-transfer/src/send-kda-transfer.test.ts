import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const transferMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1senderkda00000000000000000000000000000000000000000000000000'
    constructor(_p: unknown, _k: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    transfer = transferMock
  }
  class MockKleverProvider {
    constructor(_o: unknown) {}
  }
  class ValidationError extends Error {}
  return {
    KleverProvider: MockKleverProvider,
    NodeWallet: MockNodeWallet,
    ValidationError,
    isValidAddress: (a: string) => typeof a === 'string' && a.startsWith('klv1'),
  }
})

describe('send-kda-transfer (mocked)', () => {
  beforeEach(() => {
    transferMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_ID'] = 'MTT-ABCD'
    process.env['KLV_AMOUNT'] = '500000'
    process.env['KLV_RECIPIENT'] = 'klv1recipientkda000000000000000000000000000000000000000000000'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_ID']
    delete process.env['KLV_AMOUNT']
    delete process.env['KLV_RECIPIENT']
  })

  it('happy path — passes kda field and bigint amount', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      expect(transferMock).toHaveBeenCalledTimes(1)
      const args = transferMock.mock.calls[0]?.[0] as
        | { kda: string; amount: bigint }
        | undefined
      expect(args?.kda).toBe('MTT-ABCD')
      expect(args?.amount).toBe(500_000n)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — exits when KLV_KDA_ID missing', async () => {
    delete process.env['KLV_KDA_ID']
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
