/**
 * Live test for flow #8 — purely cryptographic, no network required.
 */
import { describe, it, expect } from 'vitest'
import { crypto as kleverCrypto, generateKeyPair, verifySignature } from '@klever/connect'

describe('sign-and-verify-message (live)', () => {
  it('cross-key verification fails (sanity)', async () => {
    const a = await generateKeyPair()
    const b = await generateKeyPair()

    const msg = new TextEncoder().encode('cross check')
    const sig = await kleverCrypto.signMessage(msg, a.privateKey)

    expect(await verifySignature(msg, sig.bytes, a.publicKey.bytes)).toBe(true)
    expect(await verifySignature(msg, sig.bytes, b.publicKey.bytes)).toBe(false)
  })
})
