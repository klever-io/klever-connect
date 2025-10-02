import { blake2b } from '@noble/hashes/blake2'

export function encodeHex(value: string): string {
  return '0x' + Buffer.from(value).toString('hex')
}

/**
 * Hash data using blake2b
 * @param data Data to hash
 * @param outputLength Output length in bytes (default: 32)
 * @returns Hash bytes
 */
export function hashBlake2b(data: Uint8Array, outputLength: number = 32): Uint8Array {
  return blake2b(data, { dkLen: outputLength })
}
