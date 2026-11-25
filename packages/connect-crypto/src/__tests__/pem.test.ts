import { describe, it, expect } from 'vitest'
import { bech32Encode, hexDecode, hexEncode } from '@klever/connect-encoding'
import { loadPrivateKeyFromPem } from '../pem'
import { getPublicKeyFromPrivate } from '../keys'

// Non-uniform keys with a-f digits, so case and partial leaks are detectable.
const keyA = hexDecode('a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90')
const keyB = hexDecode('0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0')

async function addressOf(key: Uint8Array): Promise<string> {
  return bech32Encode(await getPublicKeyFromPrivate(key), 'klv')
}

function toPem(address: string, bodyHex: string): string {
  const label = `PRIVATE KEY for ${address}`
  return `-----BEGIN ${label}-----\n${btoa(bodyHex)}\n-----END ${label}-----\n`
}

/** Everything an error exposes to a logger: message, stack and cause chain. */
function errorText(error: Error): string {
  const parts: string[] = []
  let current: unknown = error
  while (current instanceof Error) {
    parts.push(current.message, String(current.stack))
    current = current.cause
  }
  return parts.join('|').toLowerCase()
}

/** Encodings of `bytes` a leak could plausibly take. */
function leakForms(bytes: Uint8Array): string[] {
  const hex = hexEncode(bytes)
  return [hex, hex.slice(0, 16), hex.slice(-16), btoa(hex), Array.from(bytes).join(',')].map((s) =>
    s.toLowerCase(),
  )
}

async function loadError(content: string): Promise<Error> {
  try {
    await loadPrivateKeyFromPem(content)
  } catch (error) {
    return error as Error
  }
  throw new Error('expected loadPrivateKeyFromPem to throw')
}

describe('loadPrivateKeyFromPem', () => {
  it('loads a key whose header address matches', async () => {
    const address = await addressOf(keyA)
    const result = await loadPrivateKeyFromPem(toPem(address, hexEncode(keyA)))
    expect(result.address).toBe(address)
    expect(result.privateKey).toEqual(keyA)
  })

  it.each([
    ['32-byte', keyA],
    ['64-byte', new Uint8Array([...keyA, ...keyB])],
  ])('mismatch error on a %s body never contains key material', async (_, body) => {
    const claimed = await addressOf(keyB)
    const derived = await addressOf(keyA)
    const bodyHex = hexEncode(body)

    const error = await loadError(toPem(claimed, bodyHex))

    expect(error.message).toContain(claimed)
    expect(error.message).toContain(derived)
    const text = errorText(error)
    for (const form of [...leakForms(keyA), ...leakForms(body)]) {
      expect(text).not.toContain(form)
    }
  })

  it('invalid body error does not echo key characters', async () => {
    const address = await addressOf(keyA)
    // 'z' followed by a valid key nibble: hexDecode used to echo the pair.
    const bodyHex = 'z7' + hexEncode(keyA).slice(2)

    const error = await loadError(toPem(address, bodyHex))

    expect(error.message).toContain('Invalid data in PEM block')
    expect(error.message).not.toContain('z7')
  })
})
