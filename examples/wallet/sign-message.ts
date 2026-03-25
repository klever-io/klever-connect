/**
 * Message Signing Example
 *
 * Demonstrates how to:
 * 1. Sign an arbitrary message with a wallet
 * 2. Verify the signature against a public key
 * 3. Sign raw bytes (e.g., a custom auth challenge)
 */

import 'dotenv/config'
import { KleverProvider } from '@klever/connect-provider'
import { NodeWallet } from '@klever/connect-wallet'
import { verifySignature } from '@klever/connect-crypto'
import { hexDecode } from '@klever/connect-encoding'

async function main(): Promise<void> {
  const privateKey = process.env['PRIVATE_KEY']
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY environment variable')
  }

  const provider = new KleverProvider({ network: 'testnet' })
  const wallet = new NodeWallet(provider, privateKey)
  await wallet.connect()

  console.log('Address:', wallet.address)
  console.log('Public key:', wallet.publicKey)

  // --- Sign a text message ---
  const message = 'Authenticate with Klever dApp'
  const signature = await wallet.signMessage(message)

  console.log('\nSigned message:', message)
  console.log('Signature (hex):', signature.toHex())
  console.log('Signature (base64):', signature.toBase64())

  // --- Verify the signature ---
  const messageBytes = new TextEncoder().encode(message)
  const sigBytes = hexDecode(signature.toHex())
  const pubKeyBytes = hexDecode(wallet.publicKey)

  const isValid = await verifySignature(messageBytes, sigBytes, pubKeyBytes)
  console.log('\nSignature valid:', isValid) // true

  // --- Sign raw bytes (e.g., auth challenge from a server) ---
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const challengeSig = await wallet.signMessage(challenge)
  console.log('\nChallenge signature (hex):', challengeSig.toHex())

  await wallet.disconnect(true)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
