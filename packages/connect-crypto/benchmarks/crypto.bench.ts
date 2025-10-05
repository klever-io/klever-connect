import { bench, describe } from 'vitest'
import { cryptoProvider } from '@klever/connect-crypto'

/**
 * Cryptographic Operations Performance Benchmarks
 *
 * Goal: Verify crypto operations are performant
 */

describe('Key Generation Performance', () => {
  bench('generate key pair', async () => {
    await cryptoProvider.generateKeyPair()
  })
})

describe('Signing Performance', () => {
  const message = new Uint8Array(32).fill(42)
  const privateKey = new Uint8Array(32).fill(1)

  bench('sign message (32 bytes)', async () => {
    await cryptoProvider.signMessage(message, privateKey)
  })

  bench('sign message (1KB)', async () => {
    const largeMessage = new Uint8Array(1024).fill(42)
    await cryptoProvider.signMessage(largeMessage, privateKey)
  })
})

describe('Verification Performance', () => {
  let signature: Uint8Array
  let publicKey: Uint8Array
  const message = new Uint8Array(32).fill(42)
  const privateKey = new Uint8Array(32).fill(1)

  // Setup
  beforeAll(async () => {
    const keyPair = await cryptoProvider.generateKeyPair()
    publicKey = keyPair.publicKey
    const sig = await cryptoProvider.signMessage(message, privateKey)
    signature = sig.bytes
  })

  bench('verify signature', async () => {
    await cryptoProvider.verifySignature(message, signature, publicKey)
  })
})
