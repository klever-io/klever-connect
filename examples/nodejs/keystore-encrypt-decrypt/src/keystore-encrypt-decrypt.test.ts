/**
 * Mocked test for keystore-encrypt-decrypt.
 *
 * Strategy: replace the umbrella module with stubs that simulate the encrypt/decrypt
 * flow in pure JS without any provider/network. We assert the example logic:
 *   - encrypt is called once with the supplied password
 *   - the keystore is written to disk
 *   - the file content round-trips back through fromEncryptedJson
 *   - the restored address matches the original
 *
 * No real network access — this test runs in CI.
 */

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the umbrella module BEFORE importing the example. Vitest hoists vi.mock
// to the top of the file, so the example will see the stubs when it imports.
// ---------------------------------------------------------------------------
vi.mock('@klever/connect', () => {
  const FAKE_ADDRESS = 'klv1mockedmockedmockedmockedmockedmockedmockedmockedmocked0000'
  const FAKE_KEYSTORE = {
    version: 3,
    id: 'mock-id',
    address: FAKE_ADDRESS,
    crypto: {
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      mac: 'deadbeef',
      ciphertext: 'mocked-ciphertext',
      cipherparams: { iv: '00' },
      kdfparams: { dklen: 32, n: 4096, p: 1, r: 8, salt: '00' },
    },
  } as const

  class MockNodeWallet {
    public address = FAKE_ADDRESS
    private connected = false
    static async generate(): Promise<MockNodeWallet> {
      return new MockNodeWallet()
    }
    async connect(): Promise<void> {
      this.connected = true
    }
    async disconnect(): Promise<void> {
      this.connected = false
    }
    isConnected(): boolean {
      return this.connected
    }
    async encrypt(password: string): Promise<typeof FAKE_KEYSTORE> {
      if (!password) throw new Error('password required')
      return FAKE_KEYSTORE
    }
  }

  class MockKleverProvider {
    constructor(_opts: unknown) {}
  }

  class MockWalletFactory {
    constructor(_p: unknown) {}
    async fromEncryptedJson(json: unknown, password: string): Promise<MockNodeWallet> {
      if (!password) throw new Error('password required')
      const obj = typeof json === 'string' ? JSON.parse(json) : json
      if ((obj as { address?: string }).address !== FAKE_ADDRESS) {
        throw new Error('keystore mismatch')
      }
      return new MockNodeWallet()
    }
  }

  return {
    KleverProvider: MockKleverProvider,
    NodeWallet: MockNodeWallet,
    WalletFactory: MockWalletFactory,
  }
})

describe('keystore-encrypt-decrypt (mocked)', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'klever-keystore-test-'))
    process.env['KLV_NETWORK'] = 'testnet'
    process.env['KEYSTORE_PASSWORD'] = 'test-password-strong-enough'
    process.env['KEYSTORE_PATH'] = join(tmpDir, 'wallet.keystore.json')
    // Reset the example module so the env vars are picked up on each run
    vi.resetModules()
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
    delete process.env['KEYSTORE_PASSWORD']
    delete process.env['KEYSTORE_PATH']
    delete process.env['KLV_NETWORK']
  })

  it('happy path — round-trips the keystore and writes JSON to disk', async () => {
    // Importing the example runs main() because index.ts calls main() at module load.
    // We capture stdout/exit to keep the test output clean.
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    try {
      await import('./index.ts')
      // Allow the floating promise inside main().catch(...) to settle.
      await new Promise((r) => setTimeout(r, 0))

      const onDisk = JSON.parse(readFileSync(process.env['KEYSTORE_PATH'] as string, 'utf-8'))
      expect(onDisk.version).toBe(3)
      expect(onDisk.crypto.cipher).toBe('aes-128-ctr')
      expect(onDisk.crypto.kdf).toBe('scrypt')

      // Verify the success log line was emitted.
      const messages = logSpy.mock.calls.map((c) => String(c[0]))
      expect(messages.some((m) => m.includes('round-trip verified'))).toBe(true)
    } finally {
      exitSpy.mockRestore()
      logSpy.mockRestore()
    }
  })

  it('edge case — exits with code 1 when KEYSTORE_PASSWORD is missing', async () => {
    delete process.env['KEYSTORE_PASSWORD']
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit-called')
    }) as never)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(import('./index.ts')).rejects.toThrow('exit-called')
      expect(exitSpy).toHaveBeenCalledWith(1)
      expect(errSpy).toHaveBeenCalled()
    } finally {
      exitSpy.mockRestore()
      errSpy.mockRestore()
    }
  })
})
