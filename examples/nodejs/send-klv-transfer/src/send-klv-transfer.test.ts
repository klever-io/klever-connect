/**
 * Mocked test for send-klv-transfer.
 *
 * - Replaces `@klever/connect` with stubs.
 * - Verifies happy path: `wallet.transfer` is called with the parsed amount and
 *   the validated recipient.
 * - Verifies edge case: an invalid recipient address surfaces as a non-zero exit.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const transferMock = vi.fn(async () => ({ hash: 'mockhash', status: 'pending', wait: undefined }))

vi.mock('@klever/connect', () => {
  class MockNodeWallet {
    public address = 'klv1senderaddrmocksenderaddrmocksenderaddrmocksenderaddrmock00'
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
    isValidAddress: (a: string) => typeof a === 'string' && a.startsWith('klv1') && a.length > 20,
    parseKLV: (s: string) => BigInt(Math.round(Number(s) * 1_000_000)),
  }
})

describe('send-klv-transfer (mocked)', () => {
  beforeEach(() => {
    transferMock.mockClear()
    vi.resetModules()
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KLV_PRIVATE_KEY'] = '00'.repeat(32)
    process.env['KLV_AMOUNT'] = '1'
    process.env['KLV_RECIPIENT'] =
      'klv1recipientmockrecipientmockrecipientmockrecipientmock00000'
  })
  afterEach(() => {
    delete process.env['KLV_PRIVATE_KEY']
    delete process.env['KLV_RECIPIENT']
    delete process.env['KLV_AMOUNT']
  })

  it('happy path — calls wallet.transfer with parsed amount and validated recipient', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      expect(transferMock).toHaveBeenCalledTimes(1)
      const args = transferMock.mock.calls[0]?.[0] as
        | { receiver: string; amount: bigint }
        | undefined
      expect(args?.receiver).toBe(process.env['KLV_RECIPIENT'])
      expect(args?.amount).toBe(1_000_000n)
    } finally {
      logSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })

  it('edge case — invalid recipient address fails', async () => {
    process.env['KLV_RECIPIENT'] = 'not-a-valid-address'
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    try {
      await import('./index.ts')
      await new Promise((r) => setTimeout(r, 0))
      // The unhandled rejection branch should have fired.
      expect(exitSpy).toHaveBeenCalledWith(1)
      expect(transferMock).not.toHaveBeenCalled()
    } finally {
      errSpy.mockRestore()
      exitSpy.mockRestore()
    }
  })
})
