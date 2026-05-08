/**
 * Live test for flow #6 — purely cryptographic, no network involved. Kept as a
 * .testnet.test.ts solely so `npm run test:testnet` exists as a script in this
 * folder.
 */
import { describe, it, expect } from 'vitest'
import { generateKeyPair, crypto, verifySignature } from '@klever/connect'

describe('key-pair-generate-and-import (live)', () => {
  it('two independent generateKeyPair calls yield distinct keys', async () => {
    const a = await generateKeyPair()
    const b = await generateKeyPair()
    expect(a.privateKey.toHex()).not.toBe(b.privateKey.toHex())
    expect(a.publicKey.toHex()).not.toBe(b.publicKey.toHex())
  })

  it('signature verification fails for a swapped public key', async () => {
    const a = await generateKeyPair()
    const b = await generateKeyPair()

    const msg = new TextEncoder().encode('cross-key check')
    const sig = await crypto.signMessage(msg, a.privateKey)

    expect(await verifySignature(msg, sig.bytes, a.publicKey.bytes)).toBe(true)
    expect(await verifySignature(msg, sig.bytes, b.publicKey.bytes)).toBe(false)
  })
})
