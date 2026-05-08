import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1pauserowner000000000000000000000000000000000000000000000000'
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

describe('kda-pause-resume (mocked)', () => {
  let originalArgv: string[]

  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    originalArgv = process.argv
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_ID'] = 'MTT-ABCD'
  })
  afterEach(() => {
    process.argv = originalArgv
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_ID']
  })

  it('happy path — pause sends triggerType 3', async () => {
    process.argv = [...originalArgv.slice(0, 2), 'pause']
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; triggerType: number; assetId: string }
        | undefined
      expect(args?.contractType).toBe(11)
      expect(args?.triggerType).toBe(3)
      expect(args?.assetId).toBe('MTT-ABCD')
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — resume sends triggerType 4', async () => {
    process.argv = [...originalArgv.slice(0, 2), 'resume']
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { triggerType: number }
        | undefined
      expect(args?.triggerType).toBe(4)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
