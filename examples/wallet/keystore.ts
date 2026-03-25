/**
 * Keystore (Encrypted Wallet) Example
 *
 * Demonstrates how to:
 * 1. Generate a wallet and encrypt it to a keystore file
 * 2. Save/load a keystore from disk
 * 3. Restore a wallet from an encrypted keystore
 */

import 'dotenv/config'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet, WalletFactory } from '@klever/connect-wallet'

const KEYSTORE_PATH = './wallet.keystore.json'

const PASSWORD = process.env['KEYSTORE_PASSWORD']
if (!PASSWORD) {
  console.error('Error: KEYSTORE_PASSWORD environment variable is not set.')
  console.error('Add it to your .env file before running this example.')
  process.exit(1)
}

async function createAndSave(): Promise<void> {
  const provider = new KleverProvider({ network: 'testnet' })

  // Generate a new wallet
  const wallet = await NodeWallet.generate(provider)
  await wallet.connect()
  console.log('Generated address:', wallet.address)

  // Encrypt to keystore (scryptN: 4096 is fast but less secure — use default for production)
  console.log('Encrypting keystore (this may take a moment)...')
  const keystore = await wallet.encrypt(PASSWORD as string, { scryptN: 4096 })

  // Save to disk with owner-only read/write permissions (mode 0o600)
  writeFileSync(KEYSTORE_PATH, JSON.stringify(keystore, null, 2), { mode: 0o600 })
  console.log('Keystore saved to:', KEYSTORE_PATH)

  await wallet.disconnect(true)
}

async function loadAndUse(): Promise<void> {
  if (!existsSync(KEYSTORE_PATH)) {
    console.log('No keystore found, creating one first...')
    await createAndSave()
  }

  const keystoreJson = JSON.parse(readFileSync(KEYSTORE_PATH, 'utf-8'))
  const provider = new KleverProvider({ network: 'testnet' })
  const factory = new WalletFactory(provider)

  console.log('\nDecrypting keystore...')
  const wallet = await factory.fromEncryptedJson(keystoreJson, PASSWORD as string)
  await wallet.connect()

  console.log('Restored address:', wallet.address)
  console.log('Connected:', wallet.isConnected())

  await wallet.disconnect(true)
}

loadAndUse().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
