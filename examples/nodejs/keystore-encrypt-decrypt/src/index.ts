/**
 * Example: keystore-encrypt-decrypt (Flow 9)
 *
 * Demonstrates the full keystore round-trip in Node.js:
 *
 *   1. Generate a fresh wallet (random 32-byte Ed25519 private key).
 *   2. Encrypt it to the Web3 Secret Storage v3 JSON format using a passphrase
 *      (scrypt-based KDF, AES-128-CTR cipher, MAC-checked on decrypt).
 *   3. Persist the keystore to disk with restrictive file permissions (0o600).
 *   4. Restore the wallet from the on-disk keystore via `WalletFactory.fromEncryptedJson`.
 *   5. Verify the restored address matches the original — proof the round-trip is loss-free.
 *
 * Web3 Secret Storage (background)
 * --------------------------------
 * The keystore JSON is the same format used by Ethereum wallets (Geth/MetaMask).
 * The encrypted blob contains:
 *   - `crypto.cipher`         — AES-128-CTR
 *   - `crypto.kdf`            — scrypt (configurable N parameter; higher = slower & more secure)
 *   - `crypto.mac`            — HMAC over (derivedKey + ciphertext); verifies the password
 *   - `address`               — the bech32 Klever address (cleartext, for UX only)
 * The plaintext private key is NEVER written to disk.
 *
 * Why this matters
 * ----------------
 * - You can ship encrypted keystores in CI artifacts, Docker images, or shared volumes
 *   without leaking the underlying private key, as long as the passphrase stays out of band.
 * - `wallet.encrypt(passphrase)` can be tuned via `scryptN`. The default (262144) is
 *   production-grade but can take ~1-2 seconds on commodity hardware. For tests/demos
 *   you can lower it (we use 4096 here) to keep `npm start` snappy.
 *
 * Imports — settled rule of this example library
 * ----------------------------------------------
 * Always import from the umbrella `@klever/connect` package. Sub-package imports
 * (`@klever/connect-wallet`, `@klever/connect-crypto`, …) are intentionally NOT used
 * even though they would also work — the umbrella keeps every example uniform.
 */

import 'node:process'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { KleverProvider, NodeWallet, WalletFactory } from '@klever/connect'

// ---------------------------------------------------------------------------
// Step 0 — read configuration from the environment.
// ---------------------------------------------------------------------------
const KEYSTORE_PATH = resolve(process.env['KEYSTORE_PATH'] ?? './wallet.keystore.json')
const KEYSTORE_PASSWORD = process.env['KEYSTORE_PASSWORD']
const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'

if (!KEYSTORE_PASSWORD) {
  // Fail fast with a clear message — never run keystore flows with a default/empty password.
  console.error('Error: KEYSTORE_PASSWORD environment variable is required.')
  console.error('Copy .env.example to .env and set a strong passphrase before running.')
  process.exit(1)
}

async function main(): Promise<void> {
  // The provider is required to construct a wallet, but it is NOT used during
  // encrypt/decrypt itself — those operations are entirely local/offline.
  const provider = new KleverProvider({ network: NETWORK })

  // -------------------------------------------------------------------------
  // Step 1 — generate a fresh random wallet.
  // `NodeWallet.generate(provider)` calls `cryptoProvider.generateKeyPair()` under
  // the hood, which uses Node's crypto.getRandomValues for entropy.
  // -------------------------------------------------------------------------
  const wallet = await NodeWallet.generate(provider)
  await wallet.connect() // derives publicKey + bech32 address from the private key
  const originalAddress = wallet.address
  console.log(`Step 1 — generated wallet address: ${originalAddress}`)

  // -------------------------------------------------------------------------
  // Step 2 — encrypt the in-memory private key to a Web3 Secret Storage JSON.
  // We pass `scryptN: 4096` to make the example fast for demos. For production,
  // omit `options` so the SDK uses the strong default (262144).
  // -------------------------------------------------------------------------
  console.log('Step 2 — encrypting (scryptN=4096 for demo speed)...')
  const keystore = await wallet.encrypt(KEYSTORE_PASSWORD as string, { scryptN: 4096 })
  console.log(`  - keystore version: ${keystore.version}`)
  console.log(`  - cipher:           ${keystore.crypto.cipher}`)
  console.log(`  - kdf:              ${keystore.crypto.kdf}`)
  console.log(`  - address (clear):  ${keystore.address}`)

  // -------------------------------------------------------------------------
  // Step 3 — persist with owner-only permissions (mode 0o600 = rw-------).
  // On Windows the mode flag is largely advisory; on POSIX it is enforced.
  // -------------------------------------------------------------------------
  mkdirSync(dirname(KEYSTORE_PATH), { recursive: true })
  writeFileSync(KEYSTORE_PATH, JSON.stringify(keystore, null, 2), { mode: 0o600 })
  console.log(`Step 3 — keystore saved to: ${KEYSTORE_PATH}`)

  // Discard the in-memory key — we will restore it from disk below.
  await wallet.disconnect(true) // `true` = wipe the private key from RAM.

  // -------------------------------------------------------------------------
  // Step 4 — load the JSON back and restore via the WalletFactory helper.
  // `fromEncryptedJson` accepts either a parsed object or a raw JSON string.
  // -------------------------------------------------------------------------
  if (!existsSync(KEYSTORE_PATH)) {
    throw new Error(`Keystore disappeared between write and read: ${KEYSTORE_PATH}`)
  }
  const onDisk = JSON.parse(readFileSync(KEYSTORE_PATH, 'utf-8')) as Parameters<
    WalletFactory['fromEncryptedJson']
  >[0]

  console.log('Step 4 — decrypting keystore from disk...')
  const factory = new WalletFactory(provider)
  const restored = await factory.fromEncryptedJson(onDisk, KEYSTORE_PASSWORD as string)
  await restored.connect()
  console.log(`  - restored address: ${restored.address}`)

  // -------------------------------------------------------------------------
  // Step 5 — round-trip check. If the addresses differ, the keystore was corrupted
  // or the password was wrong (the latter would have thrown above; defensive only).
  // -------------------------------------------------------------------------
  if (restored.address !== originalAddress) {
    throw new Error(
      `Round-trip mismatch: expected ${originalAddress}, got ${restored.address}`,
    )
  }
  console.log('Step 5 — round-trip verified: original and restored addresses match.')

  await restored.disconnect(true)
  console.log('Done. Keystore round-trip succeeded.')
}

main().catch((err) => {
  console.error('Keystore example failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
