import { blake2b } from '@noble/hashes/blake2'

/**
 * Encodes a string to hexadecimal format with '0x' prefix
 *
 * Converts a UTF-8 string to its hexadecimal representation. The output
 * always starts with '0x' prefix for Ethereum-style compatibility.
 *
 * @param value - The string to encode to hexadecimal
 * @returns The hexadecimal string with '0x' prefix
 *
 * @example
 * ```typescript
 * const hex = encodeHex("Hello")
 * console.log(hex) // "0x48656c6c6f"
 *
 * // Encoding function signatures
 * const fnSig = encodeHex("transfer")
 * console.log(fnSig) // "0x7472616e73666572"
 * ```
 */
export function encodeHex(value: string): string {
  return '0x' + Buffer.from(value).toString('hex')
}

/**
 * Computes the BLAKE2b hash of binary data
 *
 * BLAKE2b is a cryptographic hash function that is faster than SHA-2 and SHA-3,
 * yet is at least as secure as SHA-3. It is widely used in blockchain applications
 * for its performance and security properties. The Klever blockchain uses BLAKE2b
 * for address derivation and data hashing.
 *
 * @param data - The binary data to hash
 * @param outputLength - The desired output length in bytes (default: 32)
 * @returns The hash as a Uint8Array of the specified length
 *
 * @example
 * ```typescript
 * // Standard 32-byte hash (256 bits)
 * const data = new Uint8Array([1, 2, 3, 4, 5])
 * const hash = hashBlake2b(data)
 * console.log(hash.length) // 32
 *
 * // Custom output length for shorter hashes
 * const shortHash = hashBlake2b(data, 16)
 * console.log(shortHash.length) // 16
 *
 * // Hashing public keys for address derivation
 * const publicKey = new Uint8Array(32) // secp256k1 public key
 * const addressHash = hashBlake2b(publicKey)
 * // Use addressHash for bech32 encoding
 * ```
 */
export function hashBlake2b(data: Uint8Array, outputLength: number = 32): Uint8Array {
  return blake2b(data, { dkLen: outputLength })
}
