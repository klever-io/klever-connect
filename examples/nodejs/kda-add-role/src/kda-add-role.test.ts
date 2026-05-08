import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendTxMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1roleowner000000000000000000000000000000000000000000000000000'
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

describe('kda-add-role (mocked)', () => {
  beforeEach(() => {
    sendTxMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_KDA_ID'] = 'MTT-ABCD'
    process.env['KLV_ROLE_ADDRESS'] = 'klv1grantee0000000000000000000000000000000000000000000000000000'
    process.env['KLV_ROLE_MINT'] = '1'
    process.env['KLV_ROLE_SET_ITO_PRICES'] = '0'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_KDA_ID']
    delete process.env['KLV_ROLE_ADDRESS']
    delete process.env['KLV_ROLE_MINT']
    delete process.env['KLV_ROLE_SET_ITO_PRICES']
  })

  it('happy path — sends contractType 11 / triggerType 6 with role payload', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      const args = sendTxMock.mock.calls[0]?.[0] as
        | {
            contractType: number
            triggerType: number
            assetId: string
            role: { address: string; hasRoleMint: boolean; hasRoleSetITOPrices: boolean }
          }
        | undefined
      expect(args?.contractType).toBe(11)
      expect(args?.triggerType).toBe(6)
      expect(args?.assetId).toBe('MTT-ABCD')
      expect(args?.role.address).toBe(process.env['KLV_ROLE_ADDRESS'])
      expect(args?.role.hasRoleMint).toBe(true)
      expect(args?.role.hasRoleSetITOPrices).toBe(false)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — invalid role recipient bubbles to non-zero exit', async () => {
    process.env['KLV_ROLE_ADDRESS'] = 'not-bech32'
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
