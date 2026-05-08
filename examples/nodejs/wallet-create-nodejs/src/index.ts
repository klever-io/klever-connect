/**
 * Example: wallet-create-nodejs (Flow 10)
 *
 * Demonstrates the THREE canonical ways to construct a `NodeWallet` in Node.js:
 *
 *   1. From an env-supplied private key  → `new NodeWallet(provider, hexKey)`
 *   2. Generate a fresh random wallet    → `NodeWallet.generate(provider)`
 *   3. Use the env-detecting factory     → `new WalletFactory(provider).createRandom()`
 *
 * Why three paths?
 * ----------------
 * - Path #1 is what production servers / CI workers do — the secret comes in via
 *   environment variable, secret manager, or vault.
 * - Path #2 is the simplest "give me a wallet now" flow — handy for tests, demos,
 *   one-shot scripts, or seeding a dev account that you faucet afterwards.
 * - Path #3 is identical in result but goes through `WalletFactory`, the same
 *   abstraction that picks a `BrowserWallet` when running in a browser. If your
 *   code might one day move to isomorphic territory, prefer path #3.
 *
 * All three converge on the same shape: a connected `Wallet` with `.address`,
 * `.publicKey`, `.signMessage`, `.transfer`, `.sendTransaction`, etc.
 *
 * No funds, no network signing required — this example only constructs and
 * inspects wallets.
 */

import 'node:process'

import {
  KleverProvider,
  NodeWallet,
  WalletFactory,
  isValidAddress,
} from '@klever/connect'

const NETWORK = (process.env['KLV_NETWORK'] ?? 'testnet') as 'mainnet' | 'testnet' | 'devnet'
const ENV_PRIVATE_KEY = process.env['KLV_PRIVATE_KEY']

async function main(): Promise<void> {
  const provider = new KleverProvider({ network: NETWORK })
  console.log(`Provider network: ${NETWORK}`)
  console.log()

  // -------------------------------------------------------------------------
  // Path 1 — supply a hex private key from the environment.
  // -------------------------------------------------------------------------
  console.log('Path 1 — NodeWallet from env-supplied private key')
  if (ENV_PRIVATE_KEY) {
    // The constructor accepts any 64-character hex string (with or without 0x
    // prefix). Internally it calls cryptoProvider.importPrivateKey, which throws
    // a WalletError if the key is not a valid Ed25519 scalar.
    const wallet = new NodeWallet(provider, ENV_PRIVATE_KEY)
    await wallet.connect()
    console.log(`  - address:    ${wallet.address}`)
    console.log(`  - publicKey:  ${wallet.publicKey}`)
    console.log(`  - connected:  ${wallet.isConnected()}`)
    // disconnect(true) clears the in-memory key. Use it as soon as you no longer
    // need to sign — defensive against process-memory dumps.
    await wallet.disconnect(true)
  } else {
    console.log('  - skipped (set KLV_PRIVATE_KEY in .env to enable)')
  }
  console.log()

  // -------------------------------------------------------------------------
  // Path 2 — generate a brand-new random wallet via the static factory.
  // -------------------------------------------------------------------------
  console.log('Path 2 — NodeWallet.generate (random key)')
  const generated = await NodeWallet.generate(provider)
  await generated.connect()
  console.log(`  - address:    ${generated.address}`)
  console.log(`  - publicKey:  ${generated.publicKey}`)
  // sanity-check: the bech32 address must validate against the Klever rules
  console.log(`  - valid?      ${isValidAddress(generated.address)}`)
  await generated.disconnect(true)
  console.log()

  // -------------------------------------------------------------------------
  // Path 3 — env-detecting factory. In Node.js this lands on NodeWallet too,
  // but the same call from a browser bundle would return a BrowserWallet.
  // -------------------------------------------------------------------------
  console.log('Path 3 — WalletFactory.createRandom')
  const factory = new WalletFactory(provider)
  const randomViaFactory = await factory.createRandom()
  await randomViaFactory.connect()
  console.log(`  - address:    ${randomViaFactory.address}`)
  console.log(`  - publicKey:  ${randomViaFactory.publicKey}`)
  console.log(`  - typeof:     ${randomViaFactory.constructor.name}`)
  await randomViaFactory.disconnect(true)
  console.log()

  console.log('Done. All three NodeWallet construction paths exercised.')
}

main().catch((err) => {
  console.error('wallet-create-nodejs failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
