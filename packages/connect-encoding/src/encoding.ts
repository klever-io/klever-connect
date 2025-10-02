import { base58, bech32 } from '@scure/base'

const KLEVER_ADDRESS_PREFIX = 'klv'
const KLEVER_ADDRESS_LENGTH = 32

export function base58Encode(data: Uint8Array): string {
  return base58.encode(data)
}

export function base58Decode(str: string): Uint8Array {
  return base58.decode(str)
}

export function hexEncode(data: Uint8Array): string {
  // Convert each byte to a two-digit hexadecimal string and concatenate
  // then remove zero bytes in the front living at least one byte
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hexDecode(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length')
  }

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

export function bech32Encode(data: Uint8Array, prefix: string = KLEVER_ADDRESS_PREFIX): string {
  const words = bech32.toWords(data)
  return bech32.encode(prefix, words, 90) as string
}

export function bech32Decode(address: string): { prefix: string; data: Uint8Array } {
  const decoded = bech32.decode(address as `${string}1${string}`, 90)
  const data = new Uint8Array(bech32.fromWords(decoded.words))

  if (data.length !== KLEVER_ADDRESS_LENGTH) {
    throw new Error(`Invalid address length: expected ${KLEVER_ADDRESS_LENGTH}, got ${data.length}`)
  }

  return {
    prefix: decoded.prefix,
    data,
  }
}

export function base64Encode(data: Uint8Array): string {
  return Buffer.from(data).toString('base64')
}

export function base64Decode(str: string): Uint8Array {
  return Buffer.from(str, 'base64')
}
