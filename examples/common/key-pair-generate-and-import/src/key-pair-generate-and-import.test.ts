import { describe, it, expect } from 'vitest'
import { generateKeyPair, crypto, verifySignature } from '@klever/connect'

describe('key-pair-generate-and-import', () => {
  it('generateKeyPair produces 64-char hex private and public keys', async () => {
    const kp = await generateKeyPair()
    expect(kp.privateKey.toHex()).toMatch(/^[0-9a-f]{64}$/)
    expect(kp.publicKey.toHex()).toMatch(/^[0-9a-f]{64}$/)
  })

  it('importPrivateKey + getPublicKey round-trips with generateKeyPair', async () => {
    const kp = await generateKeyPair()
    const reimported = await crypto.importPrivateKey(kp.privateKey.toHex())
    const derivedPub = await crypto.getPublicKey(reimported)
    expect(derivedPub.toHex()).toBe(kp.publicKey.toHex())
  })

  it('signing with the imported key produces a verifiable signature', async () => {
    const kp = await generateKeyPair()
    const message = new TextEncoder().encode('test')
    const sig = await crypto.signMessage(message, kp.privateKey)

    // verifySignature accepts raw byte arrays.
    const ok = await verifySignature(message, sig.bytes, kp.publicKey.bytes)
    expect(ok).toBe(true)
  })
})
