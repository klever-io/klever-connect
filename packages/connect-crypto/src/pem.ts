/**
 * PEM file utilities for loading and parsing private keys
 */

const PEM_HEADER_REGEX = /-----BEGIN (.+?)-----/
const PEM_FOOTER_REGEX = /-----END (.+?)-----/
const PRIVATE_KEY_HEADER = 'PRIVATE KEY for '

export interface PemBlock {
  type: string
  headers: Record<string, string>
  bytes: Uint8Array
}

import { bech32Encode, hexEncode, hexDecode } from '@klever/connect-encoding'
import { getPublicKeyFromPrivate } from './keys'
import type { LoadPemOptions } from './types'

/**
 * Parses PEM blocks from string content.
 *
 * @remarks
 * This function extracts all PEM blocks from a string, handling both encrypted
 * and unencrypted blocks. It parses the PEM headers, base64 data, and converts
 * the content to bytes.
 *
 * @param content - The PEM file content as a string
 * @returns An array of parsed PEM blocks
 *
 * @throws Error if the PEM data is malformed or cannot be decoded
 *
 * @internal This is an internal function used by loadPrivateKeyFromPem
 */
function parsePemBlocks(content: string): PemBlock[] {
  const blocks: PemBlock[] = []
  const lines = content.split('\n').map((line) => line.trim())

  let inBlock = false
  let currentBlock: Partial<PemBlock> | null = null
  let base64Data = ''

  for (const line of lines) {
    if (!line) continue

    const headerMatch = line.match(PEM_HEADER_REGEX)
    if (headerMatch) {
      inBlock = true
      currentBlock = {
        type: headerMatch[1] || '',
        headers: {},
        bytes: new Uint8Array(),
      }
      base64Data = ''
      continue
    }

    const footerMatch = line.match(PEM_FOOTER_REGEX)
    if (footerMatch && inBlock && currentBlock) {
      // Decode base64 data to get hex string
      try {
        const binaryString = atob(base64Data)
        // The decoded base64 is actually a hex string, so convert it to string first
        const hexString = binaryString
        // Now decode the hex string to bytes
        const bytes = hexDecode(hexString)
        currentBlock.bytes = bytes
        blocks.push(currentBlock as PemBlock)
      } catch (error) {
        throw new Error(`Invalid data in PEM block: ${String(error)}`)
      }

      inBlock = false
      currentBlock = null
      base64Data = ''
      continue
    }

    if (inBlock && currentBlock) {
      // Check for headers (e.g., DEK-Info)
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2)
        if (key && value && currentBlock.headers) {
          currentBlock.headers[key.trim()] = value.trim()
        }
      } else {
        // It's base64 data
        base64Data += line
      }
    }
  }

  return blocks
}

/**
 * Checks if a PEM block is encrypted.
 *
 * @remarks
 * Determines if a PEM block is encrypted by checking for the presence of the
 * DEK-Info header, which indicates the encryption algorithm used.
 *
 * @param block - The PEM block to check
 * @returns True if the block is encrypted, false otherwise
 *
 * @example
 * ```typescript
 * const blocks = parsePemBlocks(pemContent)
 * const isEncrypted = isEncryptedPemBlock(blocks[0])
 *
 * if (isEncrypted) {
 *   console.log('This PEM file requires a password')
 * }
 * ```
 */
export function isEncryptedPemBlock(block: PemBlock): boolean {
  return 'DEK-Info' in block.headers
}

/**
 * Decrypts an encrypted PEM block using AES-GCM encryption.
 *
 * @remarks
 * This function decrypts a PEM block that was encrypted using AES-GCM mode.
 * The decryption key is derived from the password using SHA-256.
 *
 * SECURITY WARNINGS:
 * - Use strong passwords for PEM encryption (minimum 12 characters, mix of letters, numbers, symbols)
 * - Incorrect passwords will result in decryption failure
 * - Never hardcode passwords in source code
 * - Store passwords securely (use environment variables, secure vaults, or password managers)
 *
 * @param block - The encrypted PEM block to decrypt
 * @param password - The password used to decrypt the block
 * @returns A promise that resolves to the decrypted PEM block
 *
 * @throws Error if the DEK-Info header is missing or invalid
 * @throws Error if the encryption mode is not supported (only AES-GCM is supported)
 * @throws Error if the data size is invalid
 * @throws Error if decryption fails (usually due to incorrect password)
 *
 * @internal This is an internal function used by loadPrivateKeyFromPem
 */
async function decryptPemBlock(block: PemBlock, password: string): Promise<PemBlock> {
  const dekInfo = block.headers['DEK-Info']
  if (!dekInfo) {
    throw new Error('No DEK-Info header in encrypted block')
  }

  const [mode] = dekInfo.split(',')
  if (mode !== 'AES-GCM') {
    throw new Error(`Unsupported encryption mode: ${mode}`)
  }

  // Derive encryption key from password using the same method as Go
  const encryptionKey = await getEncryptionKey(password)

  // Import key for AES-GCM
  // Cast to ArrayBuffer to satisfy SubtleCrypto type requirements
  const key = await crypto.subtle.importKey(
    'raw',
    encryptionKey.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  // Extract nonce and ciphertext
  const nonceSize = 12 // Standard GCM nonce size
  if (block.bytes.length < nonceSize) {
    throw new Error('Invalid data size')
  }

  const nonce = block.bytes.slice(0, nonceSize)
  const ciphertext = block.bytes.slice(nonceSize)

  try {
    // Decrypt the data
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
      },
      key,
      ciphertext,
    )

    return {
      type: block.type,
      headers: {},
      bytes: new Uint8Array(plaintext),
    }
  } catch (error) {
    throw new Error(`Failed to decrypt PEM block: ${String(error)}`)
  }
}

/**
 * Derives an encryption key from a password using SHA-256.
 *
 * @remarks
 * This function derives a 32-byte encryption key from a password using SHA-256 hashing.
 * It should match the Go implementation's getEncryptionKey function for compatibility.
 *
 * SECURITY WARNINGS:
 * - Use strong passwords (minimum 12 characters, mix of letters, numbers, and symbols)
 * - Passwords should not be reused across different systems
 * - Consider using a password manager to generate and store secure passwords
 * - This uses SHA-256 for key derivation; for new implementations, consider using
 *   PBKDF2, scrypt, or Argon2 for better security
 *
 * @param password - The password to derive the encryption key from
 * @returns A promise that resolves to a 32-byte encryption key
 *
 * @internal This is an internal function used by decryptPemBlock
 */
async function getEncryptionKey(password: string): Promise<Uint8Array> {
  // Convert password to bytes
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)

  // Use SHA-256 to derive a 32-byte key (matching typical Go implementations)
  const hash = await crypto.subtle.digest('SHA-256', passwordBytes)

  return new Uint8Array(hash)
}

/**
 * Loads a private key from PEM file content with address verification.
 *
 * @remarks
 * This function parses PEM content and extracts the private key. It performs
 * address verification to ensure the private key in the PEM file actually
 * corresponds to the address claimed in the PEM header, preventing tampering
 * or mistakes in PEM file generation.
 *
 * For encrypted PEM files, a password must be provided. The function supports
 * multiple PEM blocks in a single file and allows selecting a specific block
 * by index.
 *
 * SECURITY WARNINGS:
 * - Use strong passwords for encrypted PEM files (minimum 12 characters, mix of letters, numbers, symbols)
 * - Store PEM files with restrictive permissions (e.g., 600 on Unix systems)
 * - Never transmit unencrypted PEM files over insecure channels
 * - Never commit PEM files to version control
 * - Consider using hardware wallets for production applications
 * - The private key is loaded into memory; ensure your application has appropriate
 *   security measures to protect memory from unauthorized access
 *
 * @param content - PEM file content as string
 * @param options - Loading options including password and key index
 * @returns A promise that resolves to an object containing the private key bytes and address
 *
 * @throws Error if no PEM blocks are found
 * @throws Error if the index is invalid or out of range
 * @throws Error if an encrypted key is encountered without a password
 * @throws Error if the block type is invalid (doesn't start with 'PRIVATE KEY for ')
 * @throws Error if the private key does not derive to the claimed address (security check)
 * @throws Error if decryption fails (usually due to incorrect password)
 *
 * @example
 * ```typescript
 * // Load encrypted PEM
 * const pemContent = '-----BEGIN PRIVATE KEY for klv1...-----\n...'
 * const result = await loadPrivateKeyFromPem(pemContent, {
 *   password: 'your-secure-password',
 *   index: 0
 * })
 * console.log('Address:', result.address)
 * console.log('Private Key loaded successfully')
 *
 * // Load unencrypted PEM
 * const result2 = await loadPrivateKeyFromPem(pemContent)
 * ```
 */
export async function loadPrivateKeyFromPem(
  content: string,
  options: LoadPemOptions = {},
): Promise<{ privateKey: Uint8Array; address: string }> {
  const { password, index = 0 } = options

  if (index < 0) {
    throw new Error('Invalid key index')
  }

  const blocks = parsePemBlocks(content)

  if (blocks.length === 0) {
    throw new Error('No PEM blocks found in content')
  }

  if (index >= blocks.length) {
    throw new Error(`Invalid index ${index}, only ${blocks.length} blocks found`)
  }

  let block = blocks[index]
  if (!block) {
    throw new Error(`Block at index ${index} not found`)
  }

  // Check if block is encrypted
  if (isEncryptedPemBlock(block)) {
    if (!password) {
      throw new Error('Encrypted key, must provide password')
    }
    block = await decryptPemBlock(block, password)
  }

  // Validate block type
  if (!block.type.startsWith(PRIVATE_KEY_HEADER)) {
    throw new Error(
      `Invalid block type, expected '${PRIVATE_KEY_HEADER}' prefix, got: ${block.type}`,
    )
  }

  // Extract address from block type
  const addressFromPem = block.type.substring(PRIVATE_KEY_HEADER.length)

  const hexPK = hexEncode(block.bytes)
  // if block bytes length = 64, get first 32bytes
  if (block.bytes.length === 64) {
    block.bytes = block.bytes.slice(0, 32)
  }

  // Verify that the private key corresponds to the address
  const publicKeyBytes = await getPublicKeyFromPrivate(block.bytes)
  const derivedAddress = bech32Encode(publicKeyBytes, 'klv')

  if (derivedAddress !== addressFromPem) {
    throw new Error(
      `Address mismatch: PEM claims address ${addressFromPem} but private key derives to ${derivedAddress} ${hexPK}`,
    )
  }

  return {
    privateKey: block.bytes,
    address: addressFromPem,
  }
}

/**
 * Loads a private key from a PEM file on the filesystem (Node.js only).
 *
 * @remarks
 * This is a convenience wrapper that reads a PEM file from the filesystem and
 * loads the private key. This method is only available in Node.js environments.
 *
 * The function performs the same address verification as loadPrivateKeyFromPem
 * to ensure the private key corresponds to the claimed address.
 *
 * SECURITY WARNINGS:
 * - Store PEM files with restrictive permissions (e.g., 600 on Unix systems)
 * - Use strong passwords for encrypted PEM files (minimum 12 characters, mix of letters, numbers, symbols)
 * - Never commit PEM files to version control
 * - Never share PEM files over insecure channels (use encrypted transfer methods)
 * - Consider using hardware wallets for production applications
 * - Ensure the file path doesn't expose sensitive information in logs
 * - The private key is loaded into memory; ensure your application has appropriate
 *   security measures to protect memory from unauthorized access
 *
 * @param filePath - The path to the PEM file (absolute or relative)
 * @param options - Loading options including password and key index
 * @returns A promise that resolves to an object containing the private key bytes and address
 *
 * @throws Error if not in Node.js environment (browser context)
 * @throws Error if the file cannot be read
 * @throws Error if the PEM content is invalid (see loadPrivateKeyFromPem for details)
 *
 * @example
 * ```typescript
 * // Load encrypted PEM file
 * const result = await loadPrivateKeyFromPemFile('./wallet.pem', {
 *   password: 'your-secure-password'
 * })
 * console.log('Address:', result.address)
 *
 * // Load unencrypted PEM file
 * const result2 = await loadPrivateKeyFromPemFile('./wallet.pem')
 *
 * // Set appropriate file permissions (Unix/Linux/macOS)
 * // chmod 600 wallet.pem
 * ```
 */
export async function loadPrivateKeyFromPemFile(
  filePath: string,
  options: LoadPemOptions = {},
): Promise<{ privateKey: Uint8Array; address: string }> {
  // Check if we're in Node.js environment
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    throw new Error('File operations are only available in Node.js environment')
  }

  try {
    // Dynamic import to avoid bundling fs in browser builds
    const fs = await import('fs/promises')
    const content = await fs.readFile(filePath, 'utf-8')
    return loadPrivateKeyFromPem(content, options)
  } catch (error) {
    throw new Error(`Failed to read PEM file: ${String(error)}`)
  }
}
