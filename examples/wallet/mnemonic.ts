/**
 * Mnemonic (HD Wallet) Example
 *
 * Demonstrates how to:
 * 1. Generate a new BIP39 mnemonic phrase
 * 2. Restore a wallet from an existing mnemonic
 * 3. Derive multiple accounts from the same mnemonic (different paths)
 * 4. Validate a mnemonic before using it
 */

import { KleverProvider } from '@klever/connect-provider'
import { WalletFactory } from '@klever/connect-wallet'
import {
  generateMnemonicPhrase,
  isValidMnemonic,
  DEFAULT_DERIVATION_PATH,
} from '@klever/connect-crypto'

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: 'testnet' })
  const factory = new WalletFactory(provider)

  // --- Step 1: Generate a new mnemonic ---
  const mnemonic12 = generateMnemonicPhrase({ strength: 128 }) // 12 words
  const mnemonic24 = generateMnemonicPhrase({ strength: 256 }) // 24 words

  // Never log full mnemonic phrases in production applications.
  const maskMnemonic = (phrase: string): string => {
    const words = phrase.split(' ')
    return `${words[0] ?? ''} ${'*'.repeat(8)} ... ${'*'.repeat(8)} ${words[words.length - 1] ?? ''} (${words.length} words)`
  }
  console.log('12-word mnemonic (masked):', maskMnemonic(mnemonic12))
  console.log('24-word mnemonic (masked):', maskMnemonic(mnemonic24))

  // IMPORTANT: In a real app, show the full phrase to the user once and ask them to back it up.

  // --- Step 2: Validate a mnemonic ---
  console.log('Is valid (12):', isValidMnemonic(mnemonic12))
  console.log('Is valid (bad):', isValidMnemonic('these are not valid words at all'))

  // --- Step 3: Restore wallet from mnemonic ---
  const wallet = await factory.fromMnemonic(mnemonic12)
  await wallet.connect()
  console.log('\nRestored wallet address:', wallet.address)
  console.log('Restored wallet public key:', wallet.publicKey)
  console.log('Default derivation path:', DEFAULT_DERIVATION_PATH) // m/44'/690'/0'/0'/0'
  await wallet.disconnect(true)

  // --- Step 4: Derive multiple accounts from the same mnemonic ---
  // Change the last index to derive sibling accounts
  const paths = [
    "m/44'/690'/0'/0'/0'", // account 0
    "m/44'/690'/0'/0'/1'", // account 1
    "m/44'/690'/0'/0'/2'", // account 2
  ]

  console.log('\nDerived accounts:')
  for (const path of paths) {
    const derived = await factory.fromMnemonic(mnemonic12, undefined, { path })
    await derived.connect()
    console.log(`  ${path} → ${derived.address}`)
    await derived.disconnect(true)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
