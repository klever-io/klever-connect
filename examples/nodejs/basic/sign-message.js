/**
 * Sign & Verify Message
 *
 * Demonstrates off-chain message signing with a Klever wallet.
 * Useful for proving ownership of an address without sending a transaction
 * (e.g., authentication, authorization challenges, data integrity).
 *
 * Flow:
 * 1. Load wallet from private key
 * 2. Sign an arbitrary message
 * 3. Verify the signature using the wallet's own method
 * 4. Verify the signature using just the public key (simulates server-side verification)
 *
 * Usage:
 *   node basic/sign-message.js
 *   MESSAGE="custom message" node basic/sign-message.js
 *
 * Environment variables:
 *   PRIVATE_KEY - 64-char hex private key (required)
 *   NETWORK     - Network to use (default: testnet)
 *   MESSAGE     - Message to sign (default: hardcoded challenge)
 */

import 'dotenv/config'
import { KleverProvider, NodeWallet, verifySignature } from '@klever/connect'
import { hexDecode } from '@klever/connect-encoding'

const NETWORK = process.env.NETWORK || 'testnet'
const MESSAGE = process.env.MESSAGE || 'I own this Klever address — timestamp: ' + Date.now()

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY is required')
    process.exit(1)
  }

  const provider = new KleverProvider({ network: NETWORK })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  try {
    console.log(`Address:   ${wallet.address}`)
    console.log(`Public key: ${wallet.publicKey}`)
    console.log(`Message:   "${MESSAGE}"`)
    console.log('')

    // ─── Sign ───────────────────────────────────────────────────────────────
    const signature = await wallet.signMessage(MESSAGE)

    console.log(`Signature (hex):    ${signature.toHex()}`)
    console.log(`Signature (base64): ${signature.toBase64()}`)
    console.log('')

    // ─── Verify via wallet (simplest) ───────────────────────────────────────
    const validViaWallet = await wallet.verifyMessage(MESSAGE, signature)
    console.log(`Verify via wallet:     ${validViaWallet ? '✓ valid' : '✗ invalid'}`)

    // ─── Verify via wallet using hex string ─────────────────────────────────
    const validHex = await wallet.verifyMessage(MESSAGE, signature.toHex())
    console.log(`Verify via hex string: ${validHex ? '✓ valid' : '✗ invalid'}`)

    // ─── Verify standalone (server-side simulation) ─────────────────────────
    // This is what a server would do — it only needs the public key, message, and signature.
    // No private key or wallet instance needed.
    const messageBytes = new TextEncoder().encode(MESSAGE)
    const signatureBytes = signature.bytes
    const publicKeyBytes = hexDecode(wallet.publicKey)

    const validStandalone = await verifySignature(messageBytes, signatureBytes, publicKeyBytes)
    console.log(`Verify standalone:     ${validStandalone ? '✓ valid' : '✗ invalid'}`)

    // ─── Tamper test ───────────────────────────────────────────────────────
    const tamperedMessage = MESSAGE + ' (tampered)'
    const tamperedBytes = new TextEncoder().encode(tamperedMessage)
    const tampered = await verifySignature(tamperedBytes, signatureBytes, publicKeyBytes)
    console.log(
      `Tampered message:      ${tampered ? '✗ unexpectedly valid' : '✓ correctly rejected'}`,
    )
  } finally {
    await wallet.disconnect(true)
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
