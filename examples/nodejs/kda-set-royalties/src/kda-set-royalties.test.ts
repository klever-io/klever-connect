import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1royowner000000000000000000000000000000000000000000000000000'
    constructor(_p: unknown, _k: string) {}
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}
    sendTransaction = sendTxMock
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

describe('kda-set-royalties (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_ID'] = 'MNFT-ABCD'
    process.env['KLV_ROYALTIES_ADDRESS'] =
      'klv1royrecipient00000000000000000000000000000000000000000000000'
    process.env['KLV_ROYALTIES_TRANSFER_PERCENTAGE'] = '250'
    process.env['KLV_ROYALTIES_MARKET_PERCENTAGE'] = '750'
    process.env['KLV_ROYALTIES_MARKET_FIXED'] = '0'
    process.env['KLV_ROYALTIES_TRANSFER_FIXED'] = '0'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_ID']
    delete process.env['KLV_ROYALTIES_ADDRESS']
    delete process.env['KLV_ROYALTIES_TRANSFER_PERCENTAGE']
    delete process.env['KLV_ROYALTIES_MARKET_PERCENTAGE']
    delete process.env['KLV_ROYALTIES_MARKET_FIXED']
    delete process.env['KLV_ROYALTIES_TRANSFER_FIXED']
  })

  it('happy path — sends triggerType 14 with royalties payload', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | {
            contractType: number
            triggerType: number
            royalties: {
              address: string
              marketPercentage: number
              transferPercentage: Array<{ amount: bigint; percentage: number }>
            }
          }
        | undefined
      expect(args?.contractType).toBe(11)
      expect(args?.triggerType).toBe(14)
      expect(args?.royalties.address).toBe(process.env['KLV_ROYALTIES_ADDRESS'])
      expect(args?.royalties.marketPercentage).toBe(750)
      expect(args?.royalties.transferPercentage[0]?.percentage).toBe(250)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — invalid royalties address bubbles to non-zero exit', async () => {
    process.env['KLV_ROYALTIES_ADDRESS'] = 'not-bech32'
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      expect(exitSpy).toHaveBeenCalledWith(1)
      expect(sendTxMock).not.toHaveBeenCalled()
    } finally {
      errSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
