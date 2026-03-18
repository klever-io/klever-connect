/**
 * Wallet Creation Example
 *
 * Demonstrates how to:
 * 1. Create a wallet from an existing private key
 * 2. Generate a brand-new random wallet
 * 3. Use WalletFactory for environment-agnostic wallet creation
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet, WalletFactory } from '@klever/connect-wallet'

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: 'testnet' })

  // --- Option 1: From an existing private key ---
  const privateKey = process.env['PRIVATE_KEY']
  if (privateKey) {
    const wallet = new NodeWallet(provider, privateKey)
    await wallet.connect()
    console.log('[From private key] Address:', wallet.address)
    await wallet.disconnect(true)
  }

  // --- Option 2: Generate a new random wallet ---
  const newWallet = await NodeWallet.generate(provider)
  await newWallet.connect()
  console.log('[Generated] Address:', newWallet.address)

  // IMPORTANT: In a real app, save the private key before disconnecting.
  // There is currently no way to export the key after connect() — generate
  // a key pair separately if you need to persist it (see mnemonic.ts).

  await newWallet.disconnect(true)

  // --- Option 3: WalletFactory (environment-agnostic) ---
  // Automatically creates NodeWallet in Node.js and BrowserWallet in the browser.
  const factory = new WalletFactory(provider)

  if (privateKey) {
    const wallet = await factory.createWallet({ privateKey })
    await wallet.connect()
    console.log('[WalletFactory] Address:', wallet.address)
    await wallet.disconnect(true)
  } else {
    console.log('Set PRIVATE_KEY to test WalletFactory')
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
