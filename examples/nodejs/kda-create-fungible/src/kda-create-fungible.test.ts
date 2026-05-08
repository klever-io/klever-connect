import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1ownerkda000000000000000000000000000000000000000000000000000'
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

describe('kda-create-fungible (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_NAME'] = 'TestCoin'
    process.env['KLV_KDA_TICKER'] = 'TST'
    process.env['KLV_KDA_PRECISION'] = '6'
    process.env['KLV_KDA_INITIAL_SUPPLY'] = '1000000'
    process.env['KLV_KDA_MAX_SUPPLY'] = '5000000'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_NAME']
    delete process.env['KLV_KDA_TICKER']
    delete process.env['KLV_KDA_PRECISION']
    delete process.env['KLV_KDA_INITIAL_SUPPLY']
    delete process.env['KLV_KDA_MAX_SUPPLY']
  })

  it('happy path — sends contractType 1 / type 0 with parsed fields', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | {
            contractType: number
            type: number
            name: string
            ticker: string
            precision: number
            initialSupply: bigint
            maxSupply: bigint
          }
        | undefined
      expect(args?.contractType).toBe(1)
      expect(args?.type).toBe(0)
      expect(args?.name).toBe('TestCoin')
      expect(args?.ticker).toBe('TST')
      expect(args?.precision).toBe(6)
      expect(args?.initialSupply).toBe(1_000_000n)
      expect(args?.maxSupply).toBe(5_000_000n)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — exits when private key missing', async () => {
    delete process.env['KLV_PRIVATE_KEY']
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
