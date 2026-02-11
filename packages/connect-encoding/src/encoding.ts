import { base58, base64, bech32 } from '@scure/base'

const KLEVER_ADDRESS_PREFIX = 'klv'
const KLEVER_ADDRESS_LENGTH = 32

/**
 * Encodes binary data to Base58 string format
 *
 * Base58 encoding is commonly used in blockchain applications for representing
 * binary data in a human-readable format without ambiguous characters (0, O, I, l).
 *
 * @param data - The binary data to encode as a Uint8Array
 * @returns The Base58 encoded string representation of the input data
 *
 * @example
 * ```typescript
 * const data = new Uint8Array([1, 2, 3, 4, 5])
 * const encoded = base58Encode(data)
 * console.log(encoded) // "7bWpTW"
 * ```
 */
export function base58Encode(data: Uint8Array): string {
  return base58.encode(data)
}

/**
 * Decodes a Base58 string back to its original binary data
 *
 * @param str - The Base58 encoded string to decode
 * @returns The decoded binary data as a Uint8Array
 * @throws {Error} If the input string contains invalid Base58 characters
 *
 * @example
 * ```typescript
 * const encoded = "7bWpTW"
 * const decoded = base58Decode(encoded)
 * console.log(decoded) // Uint8Array(5) [1, 2, 3, 4, 5]
 * ```
 */
export function base58Decode(str: string): Uint8Array {
  return base58.decode(str)
}

/**
 * Encodes binary data to hexadecimal string format
 *
 * Converts each byte to a two-digit hexadecimal representation (lowercase).
 * This is commonly used for displaying binary data in a readable format.
 *
 * @param data - The binary data to encode as a Uint8Array
 * @returns The hexadecimal string representation (lowercase, without '0x' prefix)
 *
 * @example
 * ```typescript
 * const data = new Uint8Array([255, 0, 128, 15])
 * const hex = hexEncode(data)
 * console.log(hex) // "ff00800f"
 * ```
 */
export function hexEncode(data: Uint8Array): string {
  // Convert each byte to a two-digit hexadecimal string and concatenate
  // then remove zero bytes in the front living at least one byte
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Decodes a hexadecimal string back to its original binary data
 *
 * Accepts hex strings with or without '0x' prefix. The string must have
 * an even number of characters (each byte is represented by 2 hex digits).
 *
 * @param hex - The hexadecimal string to decode (with or without '0x' prefix)
 * @returns The decoded binary data as a Uint8Array
 * @throws {Error} If the hex string has odd length
 *
 * @example
 * ```typescript
 * const hex = "ff00800f"
 * const data = hexDecode(hex)
 * console.log(data) // Uint8Array(4) [255, 0, 128, 15]
 *
 * // Also works with 0x prefix
 * const data2 = hexDecode("0xff00800f")
 * ```
 */
export function hexDecode(hex: string): Uint8Array {
  // Strip 0x prefix if present
  const cleanHex = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex

  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have even length')
  }

  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const byteStr = cleanHex.substring(i * 2, i * 2 + 2)
    const byteValue = parseInt(byteStr, 16)
    if (Number.isNaN(byteValue)) {
      throw new Error(`Hex string contains non-hex characters at position ${i * 2}: "${byteStr}"`)
    }
    bytes[i] = byteValue
  }
  return bytes
}

/**
 * Encodes binary data to Bech32 format with a specified prefix
 *
 * Bech32 is a segwit address format used by various blockchains. It provides
 * better error detection than Base58 and is human-readable with a clear prefix.
 * For Klever, the default prefix is 'klv'.
 *
 * @param data - The binary data to encode (typically 32 bytes for addresses)
 * @param prefix - The human-readable prefix for the address (default: 'klv')
 * @returns The Bech32 encoded address string (e.g., 'klv1...')
 *
 * @example
 * ```typescript
 * const publicKeyHash = new Uint8Array(32) // 32-byte address
 * const address = bech32Encode(publicKeyHash)
 * console.log(address) // "klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqm6r0fc"
 *
 * // Custom prefix
 * const testnetAddr = bech32Encode(publicKeyHash, 'tklv')
 * console.log(testnetAddr) // "tklv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnvfjw6"
 * ```
 */
export function bech32Encode(data: Uint8Array, prefix: string = KLEVER_ADDRESS_PREFIX): string {
  const words = bech32.toWords(data)
  return bech32.encode(prefix, words, 90) as string
}

/**
 * Decodes a Bech32 address back to its original binary data
 *
 * Validates that the decoded data has the correct length for a Klever address (32 bytes).
 * Returns both the prefix and the decoded data.
 *
 * @param address - The Bech32 encoded address string to decode
 * @returns An object containing the prefix and decoded binary data
 * @throws {Error} If the address has invalid format or wrong length
 * @throws {Error} If the decoded data length is not 32 bytes
 *
 * @example
 * ```typescript
 * const address = "klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqm6r0fc"
 * const { prefix, data } = bech32Decode(address)
 * console.log(prefix) // "klv"
 * console.log(data.length) // 32
 *
 * // Works with any valid Bech32 address
 * const testnet = bech32Decode("tklv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnvfjw6")
 * console.log(testnet.prefix) // "tklv"
 * ```
 */
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

/**
 * Encodes binary data to Base64 string format
 *
 * Base64 encoding is commonly used for transmitting binary data over text-based
 * protocols or storing binary data in JSON/text formats. It represents binary data
 * using 64 printable ASCII characters.
 *
 * Uses @scure/base for consistent cross-platform support.
 *
 * @param data - The binary data to encode as a Uint8Array
 * @returns The Base64 encoded string representation
 *
 * @example
 * ```typescript
 * const data = new Uint8Array([72, 101, 108, 108, 111]) // "Hello" in bytes
 * const encoded = base64Encode(data)
 * console.log(encoded) // "SGVsbG8="
 *
 * // Encoding binary data for API transmission
 * const txData = new Uint8Array([0, 1, 2, 3, 4, 5])
 * const base64Tx = base64Encode(txData)
 * console.log(base64Tx) // "AAECAwQF"
 * ```
 */
export function base64Encode(data: Uint8Array): string {
  return base64.encode(data)
}

/**
 * Decodes a Base64 string back to its original binary data
 *
 * Handles standard Base64 encoding with padding. Useful for decoding data
 * received from APIs or stored in text formats.
 *
 * Uses @scure/base for consistent cross-platform support.
 *
 * @param str - The Base64 encoded string to decode
 * @returns The decoded binary data as a Uint8Array
 * @throws {Error} If the input string is not valid Base64
 *
 * @example
 * ```typescript
 * const encoded = "SGVsbG8="
 * const decoded = base64Decode(encoded)
 * console.log(decoded) // Uint8Array(5) [72, 101, 108, 108, 111]
 * console.log(new TextDecoder().decode(decoded)) // "Hello"
 *
 * // Decoding transaction data
 * const txBase64 = "AAECAwQF"
 * const txData = base64Decode(txBase64)
 * console.log(txData) // Uint8Array(6) [0, 1, 2, 3, 4, 5]
 * ```
 */
export function base64Decode(str: string): Uint8Array {
  return base64.decode(str)
}
