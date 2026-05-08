/**
 * Wallet Manager
 *
 * Demonstrates full wallet lifecycle in Node.js:
 * 1. Generate a new wallet with a random private key
 * 2. Encrypt to a keystore JSON file (password-protected)
 * 3. Save keystore to disk
 * 4. Restore wallet from keystore file
 * 5. Verify restored address matches original
 *
 * This is the recommended pattern for securely storing keys
 * in backend applications — never store raw private keys on disk.
 *
 * Usage:
 *   node basic/wallet-manager.js
 *
 * Environment variables:
 *   NETWORK           - Network to use (default: testnet)
 *   KEYSTORE_PASSWORD - Password to encrypt/decrypt keystore (required)
 *   KEYSTORE_PATH     - Where to save the keystore file (default: ./keystore.json)
 */

import 'dotenv/config'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { KleverProvider, NodeWallet, WalletFactory } from '@klever/connect'

const NETWORK = process.env.NETWORK || 'testnet'
const KEYSTORE_PATH = process.env.KEYSTORE_PATH || './keystore.json'
const PASSWORD = process.env.KEYSTORE_PASSWORD

if (!PASSWORD) {
  console.error('Error: KEYSTORE_PASSWORD environment variable is required')
  process.exit(1)
}

async function main() {
  const provider = new KleverProvider({ network: NETWORK })

  // ─── Step 1: Generate a new wallet ────────────────────────────────────────
  console.log('Step 1: Generating new wallet...')
  const wallet = await NodeWallet.generate(provider)
  await wallet.connect()

  try {
    console.log(`  Address:    ${wallet.address}`)
    console.log(`  Public key: ${wallet.publicKey}`)
    console.log('')

    // ─── Step 2: Encrypt to keystore ──────────────────────────────────────────
    console.log('Step 2: Encrypting wallet to keystore...')
    // scryptN: 4096 is faster (good for examples/dev). Use default (262144) in production.
    const keystore = await wallet.encrypt(PASSWORD, { scryptN: 4096 })
    console.log(`  Encrypted address: ${keystore.address}`)
    console.log('')

    // ─── Step 3: Save keystore to disk ────────────────────────────────────────
    console.log(`Step 3: Saving keystore to ${KEYSTORE_PATH}...`)
    writeFileSync(KEYSTORE_PATH, JSON.stringify(keystore, null, 2), { mode: 0o600 })
    console.log(`  Saved!`)
    console.log('')

    // ─── Step 4: Restore from keystore file ───────────────────────────────────
    console.log('Step 4: Restoring wallet from keystore file...')
    const raw = readFileSync(KEYSTORE_PATH, 'utf-8')
    const loadedKeystore = JSON.parse(raw)

    const factory = new WalletFactory(provider)
    const restored = await factory.fromEncryptedJson(loadedKeystore, PASSWORD)
    await restored.connect()

    try {
      console.log(`  Restored address: ${restored.address}`)
      console.log('')

      // ─── Step 5: Verify ───────────────────────────────────────────────────────
      console.log('Step 5: Verifying...')
      if (wallet.address === restored.address) {
        console.log(`  ✓ Addresses match — keystore round-trip successful`)
      } else {
        console.error(`  ✗ Address mismatch!`)
        console.error(`    Original: ${wallet.address}`)
        console.error(`    Restored: ${restored.address}`)
        process.exit(1)
      }
    } finally {
      await restored.disconnect(true)
    }
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
