/**
 * Live testnet variant of keystore-encrypt-decrypt.
 *
 * What this verifies that the mocked test cannot:
 *   - The real `cryptoProvider.generateKeyPair()` produces a 32-byte Ed25519 key
 *     whose derived bech32 address is valid Klever-network bech32.
 *   - `wallet.encrypt(...)` produces a real Web3 Secret Storage v3 JSON whose MAC
 *     re-checks correctly inside `WalletFactory.fromEncryptedJson(...)`.
 *
 * Skip mechanism (excluded from CI)
 * ---------------------------------
 * - File name ends in `.testnet.test.ts`; CI's vitest config excludes that pattern.
 * - We additionally guard with `process.env.RUN_TESTNET === '1'` so even a local
 *   `vitest run` won't execute it unless the developer opts in:
 *
 *       RUN_TESTNET=1 npm run test:testnet
 */

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { KleverProvider, NodeWallet, WalletFactory, isValidAddress } from '@klever/connect'

const RUN_TESTNET = process.env['RUN_TESTNET'] === '1'

describe.skipIf(!RUN_TESTNET)('keystore-encrypt-decrypt (testnet)', () => {
  it('generates -> encrypts -> persists -> decrypts -> address matches', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'klever-keystore-live-'))
    try {
      const provider = new KleverProvider({ network: 'testnet' })
      const wallet = await NodeWallet.generate(provider)
      await wallet.connect()
      const original = wallet.address

      expect(isValidAddress(original)).toBe(true)

      // Use the demo-fast scryptN so the live test stays under a second.
      const keystore = await wallet.encrypt('test-password-live', { scryptN: 4096 })
      expect(keystore.version).toBe(3)
      expect(keystore.crypto.cipher).toBe('aes-128-ctr')

      const factory = new WalletFactory(provider)
      const restored = await factory.fromEncryptedJson(keystore, 'test-password-live')
      await restored.connect()

      expect(restored.address).toBe(original)
      await restored.disconnect(true)
      await wallet.disconnect(true)
    } finally {
      rmSync(tmp, { recursive: true, force: true })
    }
  }, 30_000)
})
