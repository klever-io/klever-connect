/**
 * Flow #7 — hd-wallet-from-mnemonic
 *
 * BIP39 mnemonic + BIP44 derivation, applied to Klever's coin type (690).
 *
 * The umbrella surfaces:
 *   - WalletFactory   — env-agnostic factory; `.fromMnemonic()` builds a wallet
 *   - createWallet()  — same idea, function-style
 *
 * It does NOT (yet) re-export the lower-level mnemonic helpers
 * (`generateMnemonicPhrase`, `isValidMnemonic`, `DEFAULT_DERIVATION_PATH`),
 * so this example pulls those from `@klever/connect-crypto` directly with a
 * documented TODO.
 *
 * IMPORTANT — never log full mnemonics in production. The demo masks them.
 */

import { KleverProvider, WalletFactory } from '@klever/connect'
// TODO(KLC-2322): once the umbrella re-exports these, switch to '@klever/connect'.
import {
  generateMnemonicPhrase,
  isValidMnemonic,
  DEFAULT_DERIVATION_PATH,
} from '@klever/connect-crypto'

function maskMnemonic(phrase: string): string {
  const words = phrase.split(' ')
  if (words.length < 4) return '****'
  return `${words[0]} ${'*'.repeat(8)} ... ${'*'.repeat(8)} ${words[words.length - 1]} (${words.length} words)`
}

async function main(): Promise<void> {
  // We only need the provider to build wallets; no live network calls.
  const provider = new KleverProvider({ network: 'testnet' })
  const factory = new WalletFactory(provider)

  // ---------------------------------------------------------------------------
  // 1. Generate a new mnemonic (or read from env).
  //    Strength options: 128 bits = 12 words, 256 bits = 24 words.
  // ---------------------------------------------------------------------------
  const mnemonic = process.env['KLEVER_MNEMONIC'] ?? generateMnemonicPhrase({ strength: 128 })

  console.log(`Mnemonic source : ${process.env['KLEVER_MNEMONIC'] ? '$KLEVER_MNEMONIC' : 'generated'}`)
  console.log(`Mnemonic        : ${maskMnemonic(mnemonic)}`)
  console.log(`isValidMnemonic : ${isValidMnemonic(mnemonic)}`)
  console.log(`Default path    : ${DEFAULT_DERIVATION_PATH}\n`)

  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Refusing to derive from an invalid mnemonic.')
  }

  // ---------------------------------------------------------------------------
  // 2. Restore the default account from the mnemonic.
  //    `fromMnemonic` returns a Wallet that you can `.connect()` to expose its
  //    address.
  // ---------------------------------------------------------------------------
  const defaultWallet = await factory.fromMnemonic(mnemonic)
  try {
    await defaultWallet.connect()
    console.log('Default account (m/44\'/690\'/0\'/0\'/0\'):')
    console.log(`  address    : ${defaultWallet.address}`)
    console.log(`  publicKey  : ${defaultWallet.publicKey}`)
  } finally {
    await defaultWallet.disconnect(true)
  }

  // ---------------------------------------------------------------------------
  // 3. Derive sibling accounts at different paths.
  //    Convention: bump the last index to get account 1, 2, 3, ...
  // ---------------------------------------------------------------------------
  const paths = [
    DEFAULT_DERIVATION_PATH, // account 0
    "m/44'/690'/0'/0'/1'",   // account 1
    "m/44'/690'/0'/0'/2'",   // account 2
  ]

  console.log('\nDerived sibling accounts:')
  for (const path of paths) {
    const w = await factory.fromMnemonic(mnemonic, undefined, { path })
    try {
      await w.connect()
      console.log(`  ${path.padEnd(24)} -> ${w.address}`)
    } finally {
      await w.disconnect(true)
    }
  }

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
