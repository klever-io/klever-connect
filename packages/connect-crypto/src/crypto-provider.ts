import { bech32Decode, bech32Encode } from '@klever/connect-encoding'
import {
  PrivateKeyImpl,
  PublicKeyImpl,
  generateKeyPair as genKeyPair,
  getPublicKeyFromPrivate,
} from './keys'
import { loadPrivateKeyFromPem, loadPrivateKeyFromPemFile } from './pem'
import { SignatureImpl, signMessage as sign, verifySignature as verify } from './signing'
import type {
  CryptoProvider,
  KeyPair,
  PrivateKey,
  PublicKey,
  Signature,
  LoadPemOptions,
} from './types'

/**
 * Default implementation of the CryptoProvider interface for Klever blockchain.
 *
 * @remarks
 * This class provides a complete cryptographic provider implementation using Ed25519
 * for key generation, signing, and verification. It also handles address encoding/decoding
 * using bech32 format and supports PEM file operations for private key management.
 *
 * This provider is used throughout the Klever Connect SDK for all cryptographic operations
 * and can be replaced with custom implementations if needed (e.g., hardware wallet providers).
 *
 * SECURITY WARNING: This provider handles private keys in memory. For production applications,
 * consider using hardware wallets or secure enclaves for private key storage.
 *
 * @example
 * ```typescript
 * // Create a new provider instance
 * const provider = new DefaultCryptoProvider()
 *
 * // Generate a new key pair
 * const keyPair = await provider.generateKeyPair()
 * console.log('Address:', keyPair.publicKey.toAddress())
 *
 * // Import an existing private key
 * const privateKey = provider.importPrivateKey('your-private-key-hex')
 * const publicKey = await provider.getPublicKey(privateKey)
 *
 * // Sign a message
 * const message = new TextEncoder().encode('Hello, Klever!')
 * const signature = await provider.signMessage(message, privateKey)
 *
 * // Verify a signature
 * const isValid = await provider.verifySignature(message, signature, publicKey)
 * ```
 */
export class DefaultCryptoProvider implements CryptoProvider {
  /**
   * Generates a new Ed25519 key pair.
   *
   * @remarks
   * Creates a new cryptographically secure key pair suitable for use on the Klever blockchain.
   * The generated private key should be stored securely.
   *
   * SECURITY WARNING: Store the generated private key securely. Never expose it in logs,
   * network requests, or insecure storage. Consider using hardware wallets or encrypted
   * storage for production applications.
   *
   * @returns A promise that resolves to a KeyPair containing both private and public keys
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const keyPair = await provider.generateKeyPair()
   *
   * console.log('Private Key:', keyPair.privateKey.toHex())
   * console.log('Public Key:', keyPair.publicKey.toHex())
   * console.log('Address:', keyPair.publicKey.toAddress())
   * ```
   */
  async generateKeyPair(): Promise<KeyPair> {
    return genKeyPair()
  }

  /**
   * Imports a private key from hex string or bytes.
   *
   * @remarks
   * This method accepts private keys in two formats:
   * - Hex string (with or without '0x' prefix)
   * - Uint8Array of 32 bytes
   *
   * SECURITY WARNING: Never expose private keys in logs, network requests, or insecure storage.
   * Ensure private keys are transmitted and stored securely.
   *
   * @param key - The private key as a hex string or Uint8Array
   * @returns A PrivateKey instance
   *
   * @throws Error if the key is invalid or not 32 bytes
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   *
   * // Import from hex string
   * const privateKey1 = provider.importPrivateKey('a1b2c3...')
   *
   * // Import from hex string with 0x prefix
   * const privateKey2 = provider.importPrivateKey('0xa1b2c3...')
   *
   * // Import from bytes
   * const privateKey3 = provider.importPrivateKey(new Uint8Array(32))
   * ```
   */
  importPrivateKey(key: string | Uint8Array): PrivateKey {
    if (typeof key === 'string') {
      // Remove any 0x prefix if present
      const cleanKey = key.startsWith('0x') ? key.slice(2) : key
      return PrivateKeyImpl.fromHex(cleanKey)
    }
    return PrivateKeyImpl.fromBytes(key)
  }

  /**
   * Derives the public key from a private key.
   *
   * @remarks
   * Uses Ed25519 elliptic curve cryptography to derive the public key from the
   * given private key. The public key can be safely shared and is used for
   * signature verification and address generation.
   *
   * @param privateKey - The private key to derive from
   * @returns A promise that resolves to the corresponding PublicKey
   *
   * @throws Error if the private key is invalid
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const privateKey = provider.importPrivateKey('a1b2c3...')
   * const publicKey = await provider.getPublicKey(privateKey)
   *
   * console.log('Public Key:', publicKey.toHex())
   * console.log('Address:', publicKey.toAddress())
   * ```
   */
  async getPublicKey(privateKey: PrivateKey): Promise<PublicKey> {
    const pubKeyBytes = await getPublicKeyFromPrivate(privateKey.bytes)
    return PublicKeyImpl.fromBytes(pubKeyBytes)
  }

  /**
   * Signs a message using a private key.
   *
   * @remarks
   * Creates a cryptographic signature that proves the message was signed by the
   * holder of the private key. The signature can be verified by anyone with the
   * corresponding public key.
   *
   * SECURITY WARNING: Never expose the private key used for signing.
   *
   * @param message - The message to sign as a Uint8Array
   * @param privateKey - The private key used for signing
   * @returns A promise that resolves to the Signature
   *
   * @throws Error if the private key is invalid or signing fails
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const privateKey = provider.importPrivateKey('a1b2c3...')
   * const message = new TextEncoder().encode('Hello, Klever!')
   *
   * const signature = await provider.signMessage(message, privateKey)
   * console.log('Signature (hex):', signature.toHex())
   * console.log('Signature (base64):', signature.toBase64())
   * ```
   */
  async signMessage(message: Uint8Array, privateKey: PrivateKey): Promise<Signature> {
    const signatureBytes = await sign(message, privateKey.bytes)
    return SignatureImpl.fromBytes(signatureBytes)
  }

  /**
   * Verifies a signature against a message and public key.
   *
   * @remarks
   * Verifies that a signature was created by the holder of the private key
   * corresponding to the given public key. Returns true if valid, false otherwise.
   *
   * This function never throws on invalid signatures - it returns false instead,
   * making it safe to use in validation logic.
   *
   * @param message - The original message that was signed
   * @param signature - The signature to verify
   * @param publicKey - The public key used for verification
   * @returns A promise that resolves to true if the signature is valid, false otherwise
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const message = new TextEncoder().encode('Hello, Klever!')
   * const signature = SignatureImpl.fromHex('...')
   * const publicKey = PublicKeyImpl.fromHex('...')
   *
   * const isValid = await provider.verifySignature(message, signature, publicKey)
   * console.log('Signature valid:', isValid)
   * ```
   */
  async verifySignature(
    message: Uint8Array,
    signature: Signature,
    publicKey: PublicKey,
  ): Promise<boolean> {
    return verify(message, signature.bytes, publicKey.bytes)
  }

  /**
   * Converts a Klever address (bech32 format) to its raw bytes representation.
   *
   * @remarks
   * Klever addresses use bech32 encoding (e.g., 'klv1...'). This method decodes
   * the address to get the underlying public key bytes.
   *
   * @param address - The Klever address in bech32 format (e.g., 'klv1...')
   * @returns A promise that resolves to the 32-byte public key as Uint8Array
   *
   * @throws Error if the address is invalid or malformed
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const bytes = await provider.addressToBytes('klv1abc123...')
   * console.log('Address bytes:', bytes)
   * ```
   */
  async addressToBytes(address: string): Promise<Uint8Array> {
    const { data } = bech32Decode(address)
    return data
  }

  /**
   * Converts raw bytes to a Klever address (bech32 format).
   *
   * @remarks
   * Encodes the public key bytes into a bech32-formatted Klever address (e.g., 'klv1...').
   *
   * @param bytes - The 32-byte public key as Uint8Array
   * @returns A promise that resolves to the Klever address in bech32 format
   *
   * @throws Error if the bytes are invalid or not 32 bytes
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const publicKeyBytes = new Uint8Array(32) // Your public key bytes
   * const address = await provider.bytesToAddress(publicKeyBytes)
   * console.log('Address:', address)
   * // Prints: klv1...
   * ```
   */
  async bytesToAddress(bytes: Uint8Array): Promise<string> {
    return bech32Encode(bytes)
  }

  /**
   * Signs data using a private key hex string.
   *
   * @remarks
   * Convenience method that accepts a private key as a hex string and returns
   * the signature bytes directly. This is useful for quick signing operations
   * without creating intermediate objects.
   *
   * SECURITY WARNING: Never expose the private key hex string in logs, network
   * requests, or insecure storage.
   *
   * @param data - The data to sign as Uint8Array
   * @param privateKeyHex - The private key as a hex string
   * @returns A promise that resolves to the 64-byte signature as Uint8Array
   *
   * @throws Error if the private key is invalid or signing fails
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   * const data = new TextEncoder().encode('Hello, Klever!')
   * const signatureBytes = await provider.sign(data, 'a1b2c3...')
   * console.log('Signature bytes:', signatureBytes)
   * ```
   */
  async sign(data: Uint8Array, privateKeyHex: string): Promise<Uint8Array> {
    const privateKey = this.importPrivateKey(privateKeyHex)
    const signature = await this.signMessage(data, privateKey)
    return signature.bytes
  }

  /**
   * Imports a private key from PEM format content.
   *
   * @remarks
   * Loads a private key from PEM-formatted content. Supports both encrypted and
   * unencrypted PEM files. For encrypted files, a password must be provided.
   *
   * The PEM file is verified to ensure the private key corresponds to the address
   * claimed in the PEM header, preventing tampering or mistakes.
   *
   * SECURITY WARNINGS:
   * - Use strong passwords for PEM encryption (minimum 12 characters, mix of letters, numbers, symbols)
   * - Store PEM files securely with appropriate file permissions
   * - Never transmit unencrypted PEM files over insecure channels
   * - Consider using hardware wallets for production applications
   *
   * @param pemContent - The PEM file content as a string
   * @param options - Loading options including password and key index
   * @returns A promise that resolves to the imported PrivateKey
   *
   * @throws Error if the PEM is invalid, password is incorrect, or address verification fails
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   *
   * // Load encrypted PEM
   * const pemContent = '-----BEGIN PRIVATE KEY for klv1...-----\n...'
   * const privateKey = await provider.importPrivateKeyFromPem(pemContent, {
   *   password: 'your-secure-password',
   *   index: 0
   * })
   *
   * // Load unencrypted PEM
   * const privateKey2 = await provider.importPrivateKeyFromPem(pemContent)
   * ```
   */
  async importPrivateKeyFromPem(pemContent: string, options?: LoadPemOptions): Promise<PrivateKey> {
    const { privateKey } = await loadPrivateKeyFromPem(pemContent, options)
    return PrivateKeyImpl.fromBytes(privateKey)
  }

  /**
   * Imports a private key from a PEM file (Node.js only).
   *
   * @remarks
   * Convenience method that reads a PEM file from the filesystem and imports the
   * private key. This method is only available in Node.js environments.
   *
   * Supports both encrypted and unencrypted PEM files. For encrypted files,
   * a password must be provided.
   *
   * SECURITY WARNINGS:
   * - Store PEM files with restrictive permissions (e.g., 600 on Unix systems)
   * - Use strong passwords for PEM encryption (minimum 12 characters, mix of letters, numbers, symbols)
   * - Never commit PEM files to version control
   * - Consider using hardware wallets for production applications
   *
   * @param filePath - The path to the PEM file
   * @param options - Loading options including password and key index
   * @returns A promise that resolves to the imported PrivateKey
   *
   * @throws Error if not in Node.js environment, file cannot be read, or PEM is invalid
   *
   * @example
   * ```typescript
   * const provider = new DefaultCryptoProvider()
   *
   * // Load encrypted PEM file
   * const privateKey = await provider.importPrivateKeyFromPemFile(
   *   './wallet.pem',
   *   { password: 'your-secure-password' }
   * )
   *
   * // Load unencrypted PEM file
   * const privateKey2 = await provider.importPrivateKeyFromPemFile('./wallet.pem')
   * ```
   */
  async importPrivateKeyFromPemFile(
    filePath: string,
    options?: LoadPemOptions,
  ): Promise<PrivateKey> {
    const { privateKey } = await loadPrivateKeyFromPemFile(filePath, options)
    return PrivateKeyImpl.fromBytes(privateKey)
  }
}

/**
 * Default singleton instance of the CryptoProvider.
 *
 * @remarks
 * This is a pre-instantiated CryptoProvider instance that can be used throughout
 * the application. It's recommended to use this singleton instance rather than
 * creating new instances unless you need custom behavior.
 *
 * @example
 * ```typescript
 * import { cryptoProvider } from '@klever/connect-crypto'
 *
 * // Use the default provider
 * const keyPair = await cryptoProvider.generateKeyPair()
 * ```
 */
export const cryptoProvider = new DefaultCryptoProvider()
