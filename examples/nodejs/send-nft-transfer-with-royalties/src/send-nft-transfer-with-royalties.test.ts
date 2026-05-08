import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const transferMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1nftsender0000000000000000000000000000000000000000000000000'
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

describe('send-nft-transfer-with-royalties (mocked)', () => {
  beforeEach(() => {
    transferMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_NFT_ID'] = 'MNFT-ABCD/1'
    process.env['KLV_RECIPIENT'] =
      'klv1nftrecipient0000000000000000000000000000000000000000000000'
    process.env['KLV_ROYALTIES_KLV'] = '50000'
    process.env['KLV_ROYALTIES_KDA'] = '0'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_NFT_ID']
    delete process.env['KLV_RECIPIENT']
    delete process.env['KLV_ROYALTIES_KLV']
    delete process.env['KLV_ROYALTIES_KDA']
  })

  it('happy path — passes klvRoyalties when set', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      expect(transferMock).toHaveBeenCalledTimes(1)
      const args = transferMock.mock.calls[0]?.[0] as
        | { kda: string; amount: bigint; klvRoyalties?: bigint; kdaRoyalties?: bigint }
        | undefined
      expect(args?.kda).toBe('MNFT-ABCD/1')
      expect(args?.amount).toBe(1n)
      expect(args?.klvRoyalties).toBe(50_000n)
      expect(args?.kdaRoyalties).toBeUndefined()
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — exits when KLV_NFT_ID missing', async () => {
    delete process.env['KLV_NFT_ID']
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
