import { hexDecode, hexEncode } from '@klever/connect-encoding'
import { scrypt } from '@noble/hashes/scrypt'
import { randomBytes } from '@noble/hashes/utils'
import { PrivateKeyImpl } from './keys'
import type { PrivateKey } from './types'

export interface Keystore {
  version: 1
  id: string
  address: string
  crypto: {
    ciphertext: string
    cipherparams: {
      iv: string
      tag: string
    }
    cipher: 'aes-256-gcm'
    kdf: 'scrypt'
    kdfparams: {
      dklen: number
      salt: string
      n: number
      r: number
      p: number
    }
  }
}

export interface EncryptOptions {
  scryptN?: number
  scryptR?: number
  scryptP?: number
}

export const DEFAULT_SCRYPT_PARAMS = {
  n: 262144,
  r: 8,
  p: 1,
  dklen: 32,
}

// Generates a RFC4122 version 4 UUID
function generateUUID(): string {
  const bytes = randomBytes(16)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  bytes[8] = (bytes[8]! & 0x3f) | 0x80

  const hex = hexEncode(bytes)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

/**
 * Encrypts data using AES-256-GCM
 *
 * @remarks
 * AES-256-GCM provides both confidentiality and authenticity in a single operation.
 * The authentication tag is automatically generated and returned separately.
 *
 * **IV Requirements (Critical for Security):**
 * - Must be 96 bits (12 bytes) for optimal GCM performance
 * - Must be UNIQUE for every encryption with the same key
 * - Must be generated using a cryptographically secure random number generator
 * - Does NOT need to be secret (can be transmitted in the clear)
 * - NEVER reuse an IV with the same key (catastrophic security failure)
 *
 * @param data - Data to encrypt
 * @param key - 256-bit (32 byte) encryption key
 * @param iv - Initialization vector (must be 12 bytes, unique per encryption)
 * @returns Object containing ciphertext and authentication tag
 */
async function aes256GcmEncrypt(
  data: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<{ ciphertext: Uint8Array; tag: Uint8Array }> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key as any,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iv: iv as any,
      tagLength: 128,
    },
    cryptoKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data as any,
  )
  const encryptedArray = new Uint8Array(encrypted)
  const ciphertext = encryptedArray.slice(0, -16) // Ciphertext (all except last 16 bytes)
  const tag = encryptedArray.slice(-16) // Authentication tag (last 16 bytes)

  return { ciphertext, tag }
}

/**
 * Decrypts data using AES-256-GCM and verifies authenticity
 *
 * @remarks
 * AES-256-GCM automatically verifies the authentication tag during decryption.
 * If the tag is invalid (wrong password or tampered data), decryption will fail.
 *
 * @param ciphertext - Encrypted data
 * @param key - 256-bit (32 byte) decryption key
 * @param iv - Initialization vector used during encryption
 * @param tag - Authentication tag for verification
 * @returns Decrypted plaintext data
 * @throws Error if authentication fails (wrong password or tampered data)
 */
async function aes256GcmDecrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key as any,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  const combined = new Uint8Array(ciphertext.length + tag.length)
  combined.set(ciphertext, 0)
  combined.set(tag, ciphertext.length) // Append 16-byte tag at the end

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iv: iv as any,
      tagLength: 128, // Must match the tagLength used during encryption
    },
    cryptoKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    combined as any,
  )

  return new Uint8Array(decrypted)
}

/**
 * Encrypts a private key into a Klever Keystore V1 format.
 *
 * @remarks
 * This function uses the scrypt key derivation function (KDF) with AES-256-GCM authenticated
 * encryption to securely encrypt a private key with a password.
 *
 * Security features:
 * - Scrypt KDF with configurable parameters (default N=262144 for strong security)
 * - AES-256-GCM authenticated encryption
 * - 256-bit encryption key (stronger than AES-128)
 * - Built-in authentication tag for integrity verification
 * - Cryptographically random 12-byte IV (unique per encryption, per AES-GCM spec)
 * - Random 32-byte salt for scrypt KDF
 *
 * @param privateKey - The private key to encrypt
 * @param password - Password to protect the keystore (minimum 8 characters)
 * @param address - The wallet address associated with this key
 * @param options - Optional scrypt parameters (N, r, p) for custom security levels
 * @returns A promise that resolves to the encrypted keystore object
 *
 * @throws Error if password is empty or less than 8 characters
 * @throws Error if scryptN is not a power of 2
 * @throws Error if scryptR or scryptP are not positive numbers
 *
 * @example
 * ```typescript
 * import { generateKeyPair } from '@klever/connect-crypto'
 *
 * // Generate a key pair
 * const { privateKey, publicKey } = await generateKeyPair()
 * const address = 'klv1...'
 *
 * // Encrypt with default parameters (strong security)
 * const keystore = await encryptToKeystore(privateKey, 'my-secure-password', address)
 *
 * // Encrypt with custom parameters (faster, less secure - useful for testing)
 * const testKeystore = await encryptToKeystore(privateKey, 'password', address, {
 *   scryptN: 4096,  // Lower N = faster but less secure
 *   scryptR: 8,
 *   scryptP: 1
 * })
 *
 * // Save keystore to file
 * const keystoreJson = JSON.stringify(keystore, null, 2)
 * ```
 */
export async function encryptToKeystore(
  privateKey: PrivateKey | Uint8Array,
  password: string,
  address: string,
  options: EncryptOptions = {},
): Promise<Keystore> {
  // Password validation
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty')
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  const {
    scryptN = DEFAULT_SCRYPT_PARAMS.n,
    scryptR = DEFAULT_SCRYPT_PARAMS.r,
    scryptP = DEFAULT_SCRYPT_PARAMS.p,
  } = options

  if (scryptN <= 0 || (scryptN & (scryptN - 1)) !== 0) {
    throw new Error('scryptN must be a power of 2')
  }
  if (scryptR <= 0 || scryptP <= 0) {
    throw new Error('scryptR and scryptP must be positive')
  }

  // Generate random salt and IV
  const salt = randomBytes(32)
  const iv = randomBytes(12) // AES-GCM spec recommends 96-bit (12-byte) IV

  // Derive 32-byte key from password using scrypt
  const derivedKey = scrypt(password, salt, {
    N: scryptN,
    r: scryptR,
    p: scryptP,
    dkLen: DEFAULT_SCRYPT_PARAMS.dklen,
  })

  // Use all 32 bytes for encryption
  const encryptionKey = derivedKey

  // Get private key bytes
  const privateKeyBytes = privateKey instanceof Uint8Array ? privateKey : privateKey.bytes

  // Encrypt private key
  const { ciphertext, tag } = await aes256GcmEncrypt(privateKeyBytes, encryptionKey, iv)

  const keystore: Keystore = {
    version: 1,
    id: generateUUID(),
    address: address.replace(/^klv1?/, ''),
    crypto: {
      ciphertext: hexEncode(ciphertext),
      cipherparams: {
        iv: hexEncode(iv),
        tag: hexEncode(tag),
      },
      cipher: 'aes-256-gcm',
      kdf: 'scrypt',
      kdfparams: {
        dklen: DEFAULT_SCRYPT_PARAMS.dklen,
        salt: hexEncode(salt),
        n: scryptN,
        r: scryptR,
        p: scryptP,
      },
    },
  }

  return keystore
}

/**
 * Decrypts a Klever Keystore V1 to retrieve the private key.
 *
 * @remarks
 * This function decrypts a keystore encrypted with Klever's V1 format using AES-256-GCM
 * authenticated encryption. The authentication tag is automatically verified during
 * decryption, ensuring both the password is correct and the keystore hasn't been tampered with.
 *
 * Supported formats:
 * - Version 1 keystores only
 * - AES-256-GCM cipher
 * - Scrypt KDF
 *
 * @param keystore - The keystore object or JSON string to decrypt
 * @param password - The password used to encrypt the keystore
 * @returns A promise that resolves to the decrypted private key
 *
 * @throws Error if keystore version is not 1
 * @throws Error if cipher is not 'aes-256-gcm'
 * @throws Error if KDF is not 'scrypt'
 * @throws Error if password is incorrect (GCM authentication failed)
 * @throws Error if keystore is corrupted or tampered with
 * @throws Error if decrypted private key length is not 32 bytes
 *
 * @example
 * ```typescript
 * import { cryptoProvider } from '@klever/connect-crypto'
 *
 * // Decrypt from keystore object
 * const privateKey = await decryptKeystore(keystore, 'my-secure-password')
 *
 * // Decrypt from JSON string
 * const keystoreJson = '{"version":1,"id":"...","crypto":{...}}'
 * const privateKey2 = await decryptKeystore(keystoreJson, 'password')
 *
 * // Use the decrypted private key
 * console.log('Private key hex:', privateKey.toHex())
 * const publicKey = await cryptoProvider.getPublicKey(privateKey)
 * const address = publicKey.toAddress()
 * ```
 */
export async function decryptKeystore(
  keystore: Keystore | string,
  password: string,
): Promise<PrivateKey> {
  const ks: Keystore = typeof keystore === 'string' ? JSON.parse(keystore) : keystore

  // Validate keystore format
  if (ks.version !== 1) {
    throw new Error('Unsupported keystore version: ' + String(ks.version))
  }

  if (ks.crypto.cipher !== 'aes-256-gcm') {
    throw new Error('Unsupported cipher: ' + String(ks.crypto.cipher))
  }

  if (ks.crypto.kdf !== 'scrypt') {
    throw new Error('Unsupported KDF: ' + String(ks.crypto.kdf))
  }

  const { ciphertext, cipherparams, kdfparams } = ks.crypto

  // Decode hex strings
  const ciphertextBytes = hexDecode(ciphertext)
  const iv = hexDecode(cipherparams.iv)
  const tag = hexDecode(cipherparams.tag)
  const salt = hexDecode(kdfparams.salt)

  // Derive key from password
  const derivedKey = scrypt(password, salt, {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    dkLen: kdfparams.dklen,
  })

  // Decrypt private key with AES-256-GCM
  // GCM automatically verifies the authentication tag, throwing an error if
  // the password is wrong or the keystore has been tampered with
  const encryptionKey = derivedKey
  try {
    const privateKeyBytes = await aes256GcmDecrypt(ciphertextBytes, encryptionKey, iv, tag)

    if (privateKeyBytes.length !== 32) {
      throw new Error(`Invalid private key length: ${privateKeyBytes.length}`)
    }

    return PrivateKeyImpl.fromBytes(privateKeyBytes)
  } catch {
    throw new Error('Invalid password or corrupted keystore (authentication failed)')
  }
}

/**
 * Checks if a password is correct for a keystore.
 *
 * @remarks
 * This function verifies if a password is correct by attempting to decrypt the keystore.
 * With AES-256-GCM, authentication is performed during decryption, so we must actually
 * decrypt to verify the password..
 *
 * @param keystore - The keystore object or JSON string to check
 * @param password - The password to verify
 * @returns A promise that resolves to true if password is correct, false otherwise
 *
 * @example
 * ```typescript
 * // Verify password before using the private key
 * const isValid = await isPasswordCorrect(keystore, 'my-password')
 * if (isValid) {
 *   const privateKey = await decryptKeystore(keystore, 'my-password')
 *   console.log('Decryption successful!')
 * } else {
 *   console.error('Invalid password')
 * }
 *
 * // Quick password validation
 * if (!await isPasswordCorrect(keystore, userInput)) {
 *   throw new Error('Incorrect password')
 * }
 * ```
 */
export async function isPasswordCorrect(
  keystore: Keystore | string,
  password: string,
): Promise<boolean> {
  try {
    await decryptKeystore(keystore, password)
    return true
  } catch {
    return false
  }
}
