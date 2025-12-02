import { hexDecode, hexEncode } from '@klever/connect-encoding'
import { scrypt } from '@noble/hashes/scrypt'
import { sha256 } from '@noble/hashes/sha2'
import { randomBytes } from '@noble/hashes/utils'
import { PrivateKeyImpl } from './keys'
import type { PrivateKey } from './types'

export interface Keystore {
  version: 3
  id: string
  address: string
  crypto: {
    ciphertext: string
    cipherparams: {
      iv: string
    }
    cipher: 'aes-128-ctr'
    kdf: 'scrypt'
    kdfparams: {
      dklen: number
      salt: string
      n: number
      r: number
      p: number
    }
    mac: string
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
 * Constant-time comparison of two Uint8Arrays to prevent timing attacks.
 *
 * @remarks
 * This function compares two byte arrays in constant time, meaning the execution
 * time does not depend on where the arrays differ. This is crucial for security
 * when comparing MACs, signatures, or other cryptographic values to prevent
 * timing side-channel attacks.
 *
 * @param a - First byte array
 * @param b - Second byte array
 * @returns true if arrays are equal, false otherwise
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }

  let diff = 0
  for (let i = 0; i < a.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    diff |= a[i]! ^ b[i]!
  }

  return diff === 0
}

// Encrypts data using AES-128-CTR
async function aes128CtrEncrypt(
  data: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key as any,
    { name: 'AES-CTR' },
    false,
    ['encrypt'],
  )

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      counter: iv as any,
      length: 128,
    },
    cryptoKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data as any,
  )

  return new Uint8Array(encrypted)
}

// Decrypts data using AES-128-CTR mode
async function aes128CtrDecrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key as any,
    { name: 'AES-CTR' },
    false,
    ['decrypt'],
  )

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      counter: iv as any,
      length: 128,
    },
    cryptoKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ciphertext as any,
  )

  return new Uint8Array(decrypted)
}

/**
 * Encrypts a private key to Web3 Secret Storage Definition (version 3) keystore format.
 *
 * @remarks
 * This function uses the scrypt key derivation function (KDF) with AES-128-CTR encryption
 * to securely encrypt a private key with a password. The resulting keystore is compatible
 * with Web3 wallet standards and can be safely stored or exported.
 *
 * Security features:
 * - Scrypt KDF with configurable parameters (default N=262144 for strong security)
 * - AES-128-CTR encryption
 * - SHA-256 MAC for integrity verification
 * - Random salt and IV generation
 *
 * @param privateKey - The private key to encrypt
 * @param password - Password to protect the keystore
 * @param address - The wallet address associated with this key
 * @param options - Optional scrypt parameters (N, r, p) for custom security levels
 * @returns A promise that resolves to the encrypted keystore object
 *
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
  privateKey: PrivateKey,
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
  const iv = randomBytes(16)

  // Derive key from password using scrypt
  const derivedKey = scrypt(password, salt, {
    N: scryptN,
    r: scryptR,
    p: scryptP,
    dkLen: DEFAULT_SCRYPT_PARAMS.dklen,
  })

  // Use first 16 bytes for encryption
  const encryptionKey = derivedKey.slice(0, 16)

  // Encrypt private key
  const ciphertext = await aes128CtrEncrypt(privateKey.bytes, encryptionKey, iv)

  // Calculate MAC for integrity verification
  const macData = new Uint8Array(derivedKey.length - 16 + ciphertext.length)
  macData.set(derivedKey.slice(16), 0)
  macData.set(ciphertext, derivedKey.length - 16)
  const mac = sha256(macData)

  const keystore: Keystore = {
    version: 3,
    id: generateUUID(),
    address: address.replace(/^klv1?/, ''),
    crypto: {
      ciphertext: hexEncode(ciphertext),
      cipherparams: {
        iv: hexEncode(iv),
      },
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      kdfparams: {
        dklen: DEFAULT_SCRYPT_PARAMS.dklen,
        salt: hexEncode(salt),
        n: scryptN,
        r: scryptR,
        p: scryptP,
      },
      mac: hexEncode(mac),
    },
  }

  return keystore
}

/**
 * Decrypts a keystore to retrieve the private key.
 *
 * @remarks
 * This function decrypts a keystore encrypted with the Web3 Secret Storage Definition
 * (version 3) standard. It verifies the password using MAC authentication before
 * decrypting the private key.
 *
 * Supported formats:
 * - Version 3 keystores only
 * - AES-128-CTR cipher
 * - Scrypt KDF
 *
 * @param keystore - The keystore object or JSON string to decrypt
 * @param password - The password used to encrypt the keystore
 * @returns A promise that resolves to the decrypted private key
 *
 * @throws Error if keystore version is not 3
 * @throws Error if cipher is not 'aes-128-ctr'
 * @throws Error if KDF is not 'scrypt'
 * @throws Error if password is incorrect (MAC verification failed)
 * @throws Error if keystore is corrupted
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
 * const keystoreJson = '{"version":3,"id":"...","crypto":{...}}'
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
  if (ks.version !== 3) {
    throw new Error('Unsupported keystore version: ' + String(ks.version))
  }

  if (ks.crypto.cipher !== 'aes-128-ctr') {
    throw new Error('Unsupported cipher: ' + String(ks.crypto.cipher))
  }

  if (ks.crypto.kdf !== 'scrypt') {
    throw new Error('Unsupported KDF: ' + String(ks.crypto.kdf))
  }

  const { ciphertext, cipherparams, kdfparams, mac } = ks.crypto

  // Decode hex strings
  const ciphertextBytes = hexDecode(ciphertext)
  const iv = hexDecode(cipherparams.iv)
  const salt = hexDecode(kdfparams.salt)
  const macBytes = hexDecode(mac)

  // Derive key from password
  const derivedKey = scrypt(password, salt, {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    dkLen: kdfparams.dklen,
  })

  // Verify MAC to check password correctness
  const macData = new Uint8Array(derivedKey.length - 16 + ciphertextBytes.length)
  macData.set(derivedKey.slice(16), 0)
  macData.set(ciphertextBytes, derivedKey.length - 16)
  const computedMac = sha256(macData)

  // Constant-time comparison to prevent timing attacks
  if (!constantTimeEqual(macBytes, computedMac)) {
    throw new Error('Invalid password or corrupted keystore (MAC verification failed)')
  }

  // Decrypt private key
  const encryptionKey = derivedKey.slice(0, 16)
  const privateKeyBytes = await aes128CtrDecrypt(ciphertextBytes, encryptionKey, iv)

  if (privateKeyBytes.length !== 32) {
    throw new Error(`Invalid private key length: ${privateKeyBytes.length}`)
  }

  return PrivateKeyImpl.fromBytes(privateKeyBytes)
}

/**
 * Checks if a password is correct for a keystore without performing full decryption.
 *
 * @remarks
 * This function verifies if a password is correct by checking the MAC (Message
 * Authentication Code) without actually decrypting the private key. This is useful
 * for password validation before attempting decryption, which can be computationally
 * expensive due to scrypt.
 *
 * Note: Even though this doesn't decrypt, it still runs the full scrypt KDF which
 * can take some time with default parameters.
 *
 * @param keystore - The keystore object or JSON string to check
 * @param password - The password to verify
 * @returns A promise that resolves to true if password is correct, false otherwise
 *
 * @example
 * ```typescript
 * // Verify password before decryption
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
    const ks: Keystore = typeof keystore === 'string' ? JSON.parse(keystore) : keystore

    const { ciphertext, kdfparams, mac } = ks.crypto
    const ciphertextBytes = hexDecode(ciphertext)
    const salt = hexDecode(kdfparams.salt)
    const macBytes = hexDecode(mac)

    // Derive key from password
    const derivedKey = scrypt(password, salt, {
      N: kdfparams.n,
      r: kdfparams.r,
      p: kdfparams.p,
      dkLen: kdfparams.dklen,
    })

    // Verify MAC matches
    const macData = new Uint8Array(derivedKey.length - 16 + ciphertextBytes.length)
    macData.set(derivedKey.slice(16), 0)
    macData.set(ciphertextBytes, derivedKey.length - 16)
    const computedMac = sha256(macData)

    return constantTimeEqual(macBytes, computedMac)
  } catch {
    return false
  }
}
