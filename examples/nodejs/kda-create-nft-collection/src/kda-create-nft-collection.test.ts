import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1nftcollectionowner000000000000000000000000000000000000000'
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

describe('kda-create-nft-collection (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_NFT_NAME'] = 'NFTCol'
    process.env['KLV_NFT_TICKER'] = 'NFT'
    process.env['KLV_NFT_MAX_SUPPLY'] = '500'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_NFT_NAME']
    delete process.env['KLV_NFT_TICKER']
    delete process.env['KLV_NFT_MAX_SUPPLY']
    delete process.env['KLV_NFT_LOGO']
  })

  it('happy path — sends contractType 1 / type 1 / precision 0', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; type: number; precision: number; maxSupply: bigint; logo?: string }
        | undefined
      expect(args?.contractType).toBe(1)
      expect(args?.type).toBe(1)
      expect(args?.precision).toBe(0)
      expect(args?.maxSupply).toBe(500n)
      expect(args?.logo).toBeUndefined()
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — passes logo when KLV_NFT_LOGO set', async () => {
    process.env['KLV_NFT_LOGO'] = 'https://logo.example/x.png'
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as { logo?: string } | undefined
      expect(args?.logo).toBe('https://logo.example/x.png')
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
