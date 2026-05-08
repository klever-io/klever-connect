/**
 * Flow #8 — sign-and-verify-message
 *
 * Demonstrates:
 *   1. Sign an arbitrary message with a Klever Ed25519 private key.
 *   2. Verify the signature with the matching public key.
 *   3. Show that tampering with the message OR the signature causes
 *      verification to fail (the SDK's tamper-evident contract).
 *   4. Sign raw bytes (e.g. an auth challenge from a server).
 *
 * Isomorphic-safe: uses `crypto` (the umbrella alias for `cryptoProvider`)
 * and `verifySignature` only — no Node `fs`, no DOM, no extension.
 */

// Note: the umbrella exposes `crypto` as an alias for `cryptoProvider`
// (the SDK's signing object). Aliasing prevents collision with the global
// Web Crypto `crypto` we use for getRandomValues below.
import { crypto as kleverCrypto, generateKeyPair, verifySignature } from '@klever/connect'

async function main(): Promise<void> {
  // 1. Get a private key. Either from env or generate one.
  const userPriv = process.env['PRIVATE_KEY']
  const kp = userPriv
    ? await (async () => {
        const priv = await kleverCrypto.importPrivateKey(userPriv)
        const pub = await kleverCrypto.getPublicKey(priv)
        return { privateKey: priv, publicKey: pub }
      })()
    : await generateKeyPair()

  console.log('Public key:', kp.publicKey.toHex())

  // 2. Sign a text message.
  const message = 'Authenticate with Klever dApp'
  const messageBytes = new TextEncoder().encode(message)
  const signature = await kleverCrypto.signMessage(messageBytes, kp.privateKey)

  console.log(`\nMessage         : "${message}"`)
  console.log(`Signature (hex) : ${signature.toHex()}`)
  console.log(`Signature (b64) : ${signature.toBase64()}`)

  // 3. Verify the signature.
  const ok = await verifySignature(messageBytes, signature.bytes, kp.publicKey.bytes)
  console.log(`\nverifySignature: ${ok}    // expected true`)

  // 4. Tamper with the message — verification must fail.
  const tamperedBytes = new TextEncoder().encode(message + '!')
  const tampered = await verifySignature(tamperedBytes, signature.bytes, kp.publicKey.bytes)
  console.log(`tampered msg   : ${tampered}    // expected false`)

  // 5. Tamper with the signature — verification must fail.
  const corruptSig = new Uint8Array(signature.bytes)
  // Flip a single bit in the signature.
  corruptSig[0] = (corruptSig[0] ?? 0) ^ 1
  const sigTampered = await verifySignature(messageBytes, corruptSig, kp.publicKey.bytes)
  console.log(`tampered sig   : ${sigTampered}    // expected false`)

  // 6. Sign raw bytes (e.g., a 32-byte auth challenge).
  //    `globalThis.crypto.getRandomValues` is the Web Crypto API; available
  //    natively in Node 19+ and every browser. (Don't confuse with the
  //    aliased `kleverCrypto` above — that's the SDK's signing helper.)
  const challenge = globalThis.crypto.getRandomValues(new Uint8Array(32))

  const challengeSig = await kleverCrypto.signMessage(challenge, kp.privateKey)
  console.log(`\nChallenge sig  : ${challengeSig.toHex().slice(0, 32)}...`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
