import { describe, it, expect } from 'vitest'
import { crypto as kleverCrypto, generateKeyPair, verifySignature } from '@klever/connect'

describe('sign-and-verify-message', () => {
  it('signs and verifies a UTF-8 message', async () => {
    const kp = await generateKeyPair()
    const msg = new TextEncoder().encode('hello klever')
    const sig = await kleverCrypto.signMessage(msg, kp.privateKey)

    expect(await verifySignature(msg, sig.bytes, kp.publicKey.bytes)).toBe(true)
  })

  it('detects message tampering', async () => {
    const kp = await generateKeyPair()
    const msg = new TextEncoder().encode('hello')
    const sig = await kleverCrypto.signMessage(msg, kp.privateKey)

    const tampered = new TextEncoder().encode('hello!')
    expect(await verifySignature(tampered, sig.bytes, kp.publicKey.bytes)).toBe(false)
  })

  it('detects signature tampering', async () => {
    const kp = await generateKeyPair()
    const msg = new TextEncoder().encode('hello')
    const sig = await kleverCrypto.signMessage(msg, kp.privateKey)

    const corrupt = new Uint8Array(sig.bytes)
    corrupt[0] = (corrupt[0] ?? 0) ^ 1
    expect(await verifySignature(msg, corrupt, kp.publicKey.bytes)).toBe(false)
  })

  it('signs raw bytes (auth-challenge style)', async () => {
    const kp = await generateKeyPair()
    const challenge = globalThis.crypto.getRandomValues(new Uint8Array(32))
    const sig = await kleverCrypto.signMessage(challenge, kp.privateKey)

    expect(await verifySignature(challenge, sig.bytes, kp.publicKey.bytes)).toBe(true)
  })
})
