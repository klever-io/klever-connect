/**
 * Flow #6 — key-pair-generate-and-import
 *
 * Klever uses Ed25519 keys (32-byte private, 32-byte public). The SDK exposes:
 *
 *   - generateKeyPair()                       async, returns { privateKey, publicKey }
 *   - crypto.importPrivateKey(hex)            re-construct from a 64-char hex secret
 *   - crypto.getPublicKey(privateKey)         derive public key from private
 *
 * The umbrella exposes both `generateKeyPair` and `crypto` (alias of
 * `cryptoProvider`).
 *
 * Security notes:
 *   - NEVER log the full private key in production code. This example shows a
 *     redacted form (first 4 + last 4 chars only).
 *   - Use a CSPRNG-backed secret store (env var, secret manager, hardware) in
 *     production, never a hard-coded key.
 */

import { generateKeyPair, crypto } from '@klever/connect'

function redact(secret: string): string {
  if (secret.length <= 12) return '***'
  return `${secret.slice(0, 4)}...${secret.slice(-4)} (length=${secret.length})`
}

async function main(): Promise<void> {
  console.log('Key-pair generate / import demo\n')

  // ---------------------------------------------------------------------------
  // 1. Generate a fresh random key pair.
  // ---------------------------------------------------------------------------
  const generated = await generateKeyPair()
  console.log('1. Generated:')
  console.log(`     privateKey (hex): ${redact(generated.privateKey.toHex())}`)
  console.log(`     publicKey  (hex): ${generated.publicKey.toHex()}`)

  // ---------------------------------------------------------------------------
  // 2. Import an existing private key.
  // ---------------------------------------------------------------------------
  const userKey = process.env['PRIVATE_KEY']
  if (userKey) {
    const importedPriv = await crypto.importPrivateKey(userKey)
    const derivedPub = await crypto.getPublicKey(importedPriv)

    console.log('\n2. Imported from PRIVATE_KEY env:')
    console.log(`     privateKey (hex): ${redact(importedPriv.toHex())}`)
    console.log(`     publicKey  (hex): ${derivedPub.toHex()}`)
  } else {
    console.log('\n2. Set PRIVATE_KEY in .env to demonstrate importPrivateKey().')
  }

  // ---------------------------------------------------------------------------
  // 3. Derive a public key from a private key.
  //    Useful when you only have the secret and need to look up the matching
  //    address.
  // ---------------------------------------------------------------------------
  const derived = await crypto.getPublicKey(generated.privateKey)
  console.log('\n3. Derived public key matches generation:', derived.toHex() === generated.publicKey.toHex())

  // ---------------------------------------------------------------------------
  // 4. Sanity-check: signing with the imported private key produces a
  //    signature the public key verifies.
  // ---------------------------------------------------------------------------
  const message = new TextEncoder().encode('Klever ed25519 sanity check')
  const signature = await crypto.signMessage(message, generated.privateKey)
  console.log(`\n4. Signature (hex, ${signature.toHex().length / 2} bytes): ${signature.toHex().slice(0, 20)}...`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
