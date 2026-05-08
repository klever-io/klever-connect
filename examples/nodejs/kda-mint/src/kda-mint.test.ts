import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1minter000000000000000000000000000000000000000000000000000000'
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

describe('kda-mint (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_ID'] = 'MTT-ABCD'
    process.env['KLV_MINT_AMOUNT'] = '500000'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_ID']
    delete process.env['KLV_MINT_AMOUNT']
    delete process.env['KLV_MINT_MODE']
    delete process.env['KLV_MINT_RECEIVER']
    delete process.env['KLV_MINT_NFT_URIS']
    delete process.env['KLV_MINT_NFT_MIME']
  })

  it('happy path — fungible mint sends contractType 11, triggerType 0, with amount', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; triggerType: number; amount?: bigint; assetId: string }
        | undefined
      expect(args?.contractType).toBe(11)
      expect(args?.triggerType).toBe(0)
      expect(args?.amount).toBe(500_000n)
      expect(args?.assetId).toBe('MTT-ABCD')
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — NFT mint passes uris and mime', async () => {
    process.env['KLV_KDA_ID'] = 'MNFT-WXYZ'
    process.env['KLV_MINT_MODE'] = 'nft'
    process.env['KLV_MINT_NFT_URIS'] = JSON.stringify({ image: 'ipfs://x', metadata: 'ipfs://y' })
    process.env['KLV_MINT_NFT_MIME'] = 'image/png'
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { triggerType: number; uris?: Record<string, string>; mime?: string; amount?: unknown }
        | undefined
      expect(args?.triggerType).toBe(0)
      expect(args?.uris).toEqual({ image: 'ipfs://x', metadata: 'ipfs://y' })
      expect(args?.mime).toBe('image/png')
      expect(args?.amount).toBeUndefined()
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
