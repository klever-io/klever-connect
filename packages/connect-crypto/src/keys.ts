import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2'

import { hexEncode, hexDecode, bech32Encode } from '@klever/connect-encoding'
import type { KeyPair, PrivateKey, PublicKey } from './types'

// Configure noble-ed25519 to use sha512
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m))

/**
 * Implementation of a private key using Ed25519 cryptography.
 *
 * @remarks
 * This class represents a 32-byte Ed25519 private key used for signing transactions
 * and messages on the Klever blockchain.
 *
 * SECURITY WARNING: Never expose private keys in logs, network requests, or insecure storage.
 * Private keys should be stored securely (encrypted or in hardware wallets) and never
 * transmitted over insecure channels.
 *
 * @example
 * ```typescript
 * // Create from hex string
 * const privateKey = PrivateKeyImpl.fromHex('a1b2c3...')
 *
 * // Create from bytes
 * const privateKey = PrivateKeyImpl.fromBytes(new Uint8Array(32))
 *
 * // Convert to hex
 * const hex = privateKey.toHex()
 * ```
 */
export class PrivateKeyImpl implements PrivateKey {
  constructor(public readonly bytes: Uint8Array) {
    if (bytes.length !== 32) {
      throw new Error('Private key must be 32 bytes')
    }
  }

  get hex(): string {
    return this.toHex()
  }

  toHex(): string {
    return hexEncode(this.bytes)
  }

  static fromHex(hex: string): PrivateKeyImpl {
    return new PrivateKeyImpl(hexDecode(hex))
  }

  static fromBytes(bytes: Uint8Array): PrivateKeyImpl {
    return new PrivateKeyImpl(bytes)
  }
}

/**
 * Implementation of a public key using Ed25519 cryptography.
 *
 * @remarks
 * This class represents a 32-byte Ed25519 public key derived from a private key.
 * Public keys are used to verify signatures and can be safely shared.
 * They can also be converted to Klever blockchain addresses.
 *
 * @example
 * ```typescript
 * // Create from hex string
 * const publicKey = PublicKeyImpl.fromHex('a1b2c3...')
 *
 * // Create from bytes
 * const publicKey = PublicKeyImpl.fromBytes(new Uint8Array(32))
 *
 * // Convert to Klever address (bech32 format)
 * const address = publicKey.toAddress()
 * // Returns: 'klv1...'
 *
 * // Convert to hex
 * const hex = publicKey.toHex()
 * ```
 */
export class PublicKeyImpl implements PublicKey {
  constructor(public readonly bytes: Uint8Array) {
    if (bytes.length !== 32) {
      throw new Error('Public key must be 32 bytes')
    }
  }

  get hex(): string {
    return this.toHex()
  }

  toHex(): string {
    return hexEncode(this.bytes)
  }

  toAddress(): string {
    return bech32Encode(this.bytes)
  }

  static fromHex(hex: string): PublicKeyImpl {
    return new PublicKeyImpl(hexDecode(hex))
  }

  static fromBytes(bytes: Uint8Array): PublicKeyImpl {
    return new PublicKeyImpl(bytes)
  }
}

/**
 * Generates a new Ed25519 key pair asynchronously using cryptographically secure random bytes.
 *
 * @remarks
 * This function uses the noble-ed25519 library to generate a secure random private key
 * and derives the corresponding public key. The asynchronous version is recommended
 * for better performance in environments that support it.
 *
 * SECURITY WARNING: The generated private key must be stored securely. Never expose
 * it in logs, network requests, or insecure storage. Consider using hardware wallets
 * or encrypted storage for production applications.
 *
 * @returns A promise that resolves to a KeyPair object containing both private and public keys
 *
 * @example
 * ```typescript
 * // Generate a new key pair
 * const keyPair = await generateKeyPair()
 *
 * // Access the keys
 * const privateKeyHex = keyPair.privateKey.toHex()
 * const publicKeyHex = keyPair.publicKey.toHex()
 * const address = keyPair.publicKey.toAddress()
 *
 * console.log('Address:', address)
 * // Prints: klv1...
 * ```
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const privateKeyBytes = ed.utils.randomPrivateKey()
  const publicKeyBytes = await ed.getPublicKeyAsync(privateKeyBytes)

  return {
    privateKey: new PrivateKeyImpl(privateKeyBytes),
    publicKey: new PublicKeyImpl(publicKeyBytes),
  }
}

/**
 * Generates a new Ed25519 key pair synchronously using cryptographically secure random bytes.
 *
 * @remarks
 * This function uses the noble-ed25519 library to generate a secure random private key
 * and derives the corresponding public key. The synchronous version is provided for
 * environments that don't support async operations, but the async version is generally
 * preferred for better performance.
 *
 * SECURITY WARNING: The generated private key must be stored securely. Never expose
 * it in logs, network requests, or insecure storage. Consider using hardware wallets
 * or encrypted storage for production applications.
 *
 * @returns A KeyPair object containing both private and public keys
 *
 * @example
 * ```typescript
 * // Generate a new key pair synchronously
 * const keyPair = generateKeyPairSync()
 *
 * // Access the keys
 * const privateKeyHex = keyPair.privateKey.toHex()
 * const publicKeyHex = keyPair.publicKey.toHex()
 * const address = keyPair.publicKey.toAddress()
 *
 * console.log('Address:', address)
 * // Prints: klv1...
 * ```
 */
export function generateKeyPairSync(): KeyPair {
  const privateKeyBytes = ed.utils.randomPrivateKey()
  const publicKeyBytes = ed.getPublicKey(privateKeyBytes)

  return {
    privateKey: new PrivateKeyImpl(privateKeyBytes),
    publicKey: new PublicKeyImpl(publicKeyBytes),
  }
}

/**
 * Derives the public key from a private key asynchronously.
 *
 * @remarks
 * This function uses Ed25519 elliptic curve cryptography to derive the public key
 * from the given private key. The public key can be safely shared and is used for
 * signature verification and address generation.
 *
 * @param privateKey - The 32-byte private key as a Uint8Array
 * @returns A promise that resolves to the 32-byte public key as a Uint8Array
 *
 * @throws Error if the private key is invalid or not 32 bytes
 *
 * @example
 * ```typescript
 * const privateKeyBytes = new Uint8Array(32) // Your private key bytes
 * const publicKeyBytes = await getPublicKeyFromPrivate(privateKeyBytes)
 *
 * // Convert to PublicKeyImpl for additional methods
 * const publicKey = PublicKeyImpl.fromBytes(publicKeyBytes)
 * const address = publicKey.toAddress()
 * ```
 */
export async function getPublicKeyFromPrivate(privateKey: Uint8Array): Promise<Uint8Array> {
  return ed.getPublicKeyAsync(privateKey)
}

/**
 * Derives the public key from a private key synchronously.
 *
 * @remarks
 * This function uses Ed25519 elliptic curve cryptography to derive the public key
 * from the given private key. The synchronous version is provided for environments
 * that don't support async operations, but the async version is generally preferred.
 *
 * @param privateKey - The 32-byte private key as a Uint8Array
 * @returns The 32-byte public key as a Uint8Array
 *
 * @throws Error if the private key is invalid or not 32 bytes
 *
 * @example
 * ```typescript
 * const privateKeyBytes = new Uint8Array(32) // Your private key bytes
 * const publicKeyBytes = getPublicKeyFromPrivateSync(privateKeyBytes)
 *
 * // Convert to PublicKeyImpl for additional methods
 * const publicKey = PublicKeyImpl.fromBytes(publicKeyBytes)
 * const address = publicKey.toAddress()
 * ```
 */
export function getPublicKeyFromPrivateSync(privateKey: Uint8Array): Uint8Array {
  return ed.getPublicKey(privateKey)
}
