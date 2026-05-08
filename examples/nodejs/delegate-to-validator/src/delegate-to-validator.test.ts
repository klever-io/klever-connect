import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1delegator0000000000000000000000000000000000000000000000000'
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

describe('delegate-to-validator (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_BUCKET_ID'] = 'bucket-1'
    process.env['KLV_VALIDATOR'] =
      'klv1validatoraddrvalidatoraddrvalidatoraddrvalidatoraddr00000'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_BUCKET_ID']
    delete process.env['KLV_VALIDATOR']
  })

  it('happy path — sends contractType 6 with receiver and bucketId', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | { contractType: number; receiver: string; bucketId: string }
        | undefined
      expect(args?.contractType).toBe(6)
      expect(args?.receiver).toBe(process.env['KLV_VALIDATOR'])
      expect(args?.bucketId).toBe('bucket-1')
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — invalid validator address bubbles up', async () => {
    process.env['KLV_VALIDATOR'] = 'not-bech32'
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
