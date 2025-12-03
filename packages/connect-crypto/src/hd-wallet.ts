import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { PrivateKeyImpl } from './keys'
import type { PrivateKey } from './types'
import { deriveEd25519PrivateKey } from './slip10-ed25519'

// Default BIP44 derivation path for Klever
export const DEFAULT_DERIVATION_PATH = "m/44'/690'/0'/0'/0'"

// Klever's registered coin type in BIP44
export const KLEVER_COIN_TYPE = 690

// Valid mnemonic strengths in bits (12-24 words)
export type MnemonicStrength = 128 | 160 | 192 | 224 | 256

export interface GenerateMnemonicOptions {
  strength?: MnemonicStrength
}

export interface MnemonicToKeyOptions {
  path?: string
  passphrase?: string
}

/**
 * Generates a new BIP39 mnemonic phrase with specified strength.
 *
 * @param options - Generation options including strength
 * @returns A space-separated mnemonic phrase
 *
 * @throws Error if strength is not one of the valid values (128, 160, 192, 224, 256)
 *
 * @example
 * ```typescript
 * // Generate 12-word mnemonic (default)
 * const mnemonic = generateMnemonicPhrase()
 *
 * // Generate 24-word mnemonic
 * const strongMnemonic = generateMnemonicPhrase({ strength: 256 })
 * ```
 */
export function generateMnemonicPhrase(options: GenerateMnemonicOptions = {}): string {
  const { strength = 128 } = options

  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error('Invalid strength. Must be 128, 160, 192, 224, or 256')
  }

  return generateMnemonic(wordlist, strength)
}

/**
 * Validates a BIP39 mnemonic phrase.
 *
 * @param mnemonic - The mnemonic phrase to validate
 * @returns True if the mnemonic is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isValidMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
 * console.log(isValid) // true
 * ```
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist)
}

/**
 * Converts a mnemonic phrase to a private key using SLIP-0010 Ed25519 derivation.
 *
 *
 * @param mnemonic - The BIP39 mnemonic phrase
 * @param options - Options including derivation path and passphrase
 * @returns The derived private key
 *
 * @throws Error if the mnemonic phrase is invalid
 * @throws Error if the derivation fails or produces an invalid key
 *
 * @example
 * ```typescript
 * // Derive with default path
 * const key = mnemonicToPrivateKey('your mnemonic phrase here')
 *
 * // Derive with custom path and passphrase
 * const key2 = mnemonicToPrivateKey('your mnemonic phrase here', {
 *   path: "m/44'/690'/0'/0'/1'",
 *   passphrase: 'optional-passphrase'
 * })
 * ```
 */
export function mnemonicToPrivateKey(
  mnemonic: string,
  options: MnemonicToKeyOptions = {},
): PrivateKey {
  const { path = DEFAULT_DERIVATION_PATH, passphrase = '' } = options

  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase')
  }

  // Convert mnemonic to seed
  const seed = mnemonicToSeedSync(mnemonic, passphrase)

  const privateKeyBytes = deriveEd25519PrivateKey(seed, path)

  // Ensure key is 32 bytes (256 bits)
  if (privateKeyBytes.length !== 32) {
    throw new Error(`Invalid derived key length: ${privateKeyBytes.length}`)
  }

  return PrivateKeyImpl.fromBytes(privateKeyBytes)
}

/**
 * Derives multiple sequential private keys from a mnemonic phrase.
 *
 * @remarks
 * This function takes the base derivation path and increments the last index
 * to generate multiple keys sequentially. For example, if the path is
 * "m/44'/690'/0'/0'/0'", it will generate keys at indices 0', 1', 2', etc.
 *
 * @param mnemonic - The BIP39 mnemonic phrase
 * @param count - Number of keys to derive (must be at least 1)
 * @param options - Options including derivation path and passphrase
 * @returns Array of derived private keys
 *
 * @throws Error if count is less than 1
 * @throws Error if the mnemonic phrase is invalid
 *
 * @example
 * ```typescript
 * // Derive 5 sequential keys starting from default path
 * const keys = deriveMultipleKeys('your mnemonic here', 5)
 * // Generates keys at: m/44'/690'/0'/0'/0', m/44'/690'/0'/0'/1', ..., m/44'/690'/0'/0'/4'
 *
 * // Derive with custom starting path
 * const keys2 = deriveMultipleKeys('your mnemonic here', 3, {
 *   path: "m/44'/690'/0'/0'/10'"
 * })
 * // Generates keys at: m/44'/690'/0'/0'/10', m/44'/690'/0'/0'/11', m/44'/690'/0'/0'/12'
 * ```
 */
export function deriveMultipleKeys(
  mnemonic: string,
  count: number,
  options: MnemonicToKeyOptions = {},
): PrivateKey[] {
  if (count < 1) {
    throw new Error('Count must be at least 1')
  }

  const { path = DEFAULT_DERIVATION_PATH, passphrase } = options

  // Extract base path and starting index from derivation path
  const pathParts = path.split('/')
  const basePath = pathParts.slice(0, -1).join('/')
  const startIndex = parseInt(pathParts[pathParts.length - 1] || '0', 10)

  const keys: PrivateKey[] = []

  // Generate keys by incrementing the last index
  for (let i = 0; i < count; i++) {
    const derivationPath = `${basePath}/${startIndex + i}`
    const key =
      passphrase !== undefined
        ? mnemonicToPrivateKey(mnemonic, { path: derivationPath, passphrase })
        : mnemonicToPrivateKey(mnemonic, { path: derivationPath })
    keys.push(key)
  }

  return keys
}

/**
 * Builds a BIP44 derivation path for Klever accounts.
 *
 * @remarks
 * Constructs a derivation path following the BIP44 standard:
 * m/44'/coin_type'/account'/change'/index'
 *
 * Where:
 * - 44' is the BIP44 purpose (hardened)
 * - coin_type is Klever's registered coin type (690, hardened)
 * - account' is the account index (hardened)
 * - change' is 0' for external (receiving) or 1' for internal (change) addresses (hardened)
 * - index' is the address index (hardened)
 *
 * @param account - Account index (default: 0, must be non-negative integer)
 * @param change - Chain type: 0 for external, 1 for internal (default: 0)
 * @param index - Address index (default: 0, must be non-negative integer)
 * @returns The formatted BIP44 derivation path
 *
 * @throws Error if account is negative or not an integer
 * @throws Error if change is not 0 or 1
 * @throws Error if index is negative or not an integer
 *
 * @example
 * ```typescript
 * // Build default path
 * const path1 = buildDerivationPath()
 * // Returns: "m/44'/690'/0'/0'/0'"
 *
 * // Build path for second account, first address
 * const path2 = buildDerivationPath(1, 0, 0)
 * // Returns: "m/44'/690'/1'/0'/0'"
 *
 * // Build path for change address
 * const path3 = buildDerivationPath(0, 1, 5)
 * // Returns: "m/44'/690'/0'/1'/5'"
 * ```
 */
export function buildDerivationPath(
  account: number = 0,
  change: number = 0,
  index: number = 0,
): string {
  if (account < 0 || !Number.isInteger(account)) {
    throw new Error('Account must be a non-negative integer')
  }
  if (change < 0 || change > 1 || !Number.isInteger(change)) {
    throw new Error('Change must be 0 (external) or 1 (internal)')
  }
  if (index < 0 || !Number.isInteger(index)) {
    throw new Error('Index must be a non-negative integer')
  }

  return `m/44'/${KLEVER_COIN_TYPE}'/${account}'/${change}'/${index}'`
}
