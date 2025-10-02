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
 * Parse PEM blocks from string content
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
 * Check if a PEM block is encrypted
 */
export function isEncryptedPemBlock(block: PemBlock): boolean {
  return 'DEK-Info' in block.headers
}

/**
 * Decrypt a PEM block using AES-GCM
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
  const key = await crypto.subtle.importKey(
    'raw',
    encryptionKey as BufferSource,
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
 * Derive encryption key from password
 * This should match the Go implementation's getEncryptionKey function
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
 * Load private key from PEM file content
 *
 * This function performs address verification to ensure the private key
 * in the PEM file actually corresponds to the address claimed in the PEM header.
 * This prevents tampering or mistakes in PEM file generation.
 *
 * @param content - PEM file content as string
 * @param options - Loading options including password and key index
 * @returns Private key bytes and address from the PEM block
 * @throws Error if the private key does not derive to the claimed address
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
 * Load private key from PEM file (Node.js environment)
 * This is a convenience wrapper that reads the file for you
 */
export async function loadPrivateKeyFromPemFile(
  filePath: string,
  options: LoadPemOptions = {},
): Promise<{ privateKey: Uint8Array; address: string }> {
  // Check if we're in Node.js environment
  if (typeof window !== 'undefined') {
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
