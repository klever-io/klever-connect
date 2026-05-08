import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({
  hash: 'mockhash',
  status: 'pending',
  wait: async () => ({ status: 'success' }),
}))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1ownermeta00000000000000000000000000000000000000000000000000'
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

describe('kda-update-logo-and-uris (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_ID'] = 'MTT-ABCD'
    process.env['KLV_KDA_LOGO'] = 'https://logo.example/x.png'
    process.env['KLV_KDA_URIS'] = '{"website":"https://example.com"}'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_ID']
    delete process.env['KLV_KDA_LOGO']
    delete process.env['KLV_KDA_URIS']
  })

  it('happy path — sends both UpdateLogo (10) and UpdateURIs (11)', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      expect(sendTxMock).toHaveBeenCalledTimes(2)
      const a = sendTxMock.mock.calls[0]?.[0] as
        | { triggerType: number; logo: string }
        | undefined
      const b = sendTxMock.mock.calls[1]?.[0] as
        | { triggerType: number; uris: Record<string, string> }
        | undefined
      expect(a?.triggerType).toBe(10)
      expect(a?.logo).toBe('https://logo.example/x.png')
      expect(b?.triggerType).toBe(11)
      expect(b?.uris.website).toBe('https://example.com')
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — invalid JSON in KLV_KDA_URIS exits 1', async () => {
    process.env['KLV_KDA_URIS'] = '{not json'
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
