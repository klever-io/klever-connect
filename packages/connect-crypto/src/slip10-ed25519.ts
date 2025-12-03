import { hmac } from '@noble/hashes/hmac'
import { sha512 } from '@noble/hashes/sha512'

const ED25519_SEED_KEY = new Uint8Array([101, 100, 50, 53, 53, 49, 57, 32, 115, 101, 101, 100]) // "ed25519 seed"
const HARDENED_OFFSET = 0x80000000

export interface PathComponent {
  index: number
  hardened: boolean
}

/**
 * Parse a BIP44 derivation path into components
 * Example: "m/44'/690'/0'/0'/0'" -> [{index: 44, hardened: true}, ...]
 */
export function parsePath(path: string): PathComponent[] {
  if (!path.startsWith('m/')) {
    throw new Error('Path must start with "m/"')
  }

  const components: PathComponent[] = []
  const parts = path.slice(2).split('/') // Remove 'm/'

  for (const part of parts) {
    if (!part) continue

    const hardened = part.endsWith("'")
    const indexStr = hardened ? part.slice(0, -1) : part
    const index = parseInt(indexStr, 10)

    if (isNaN(index) || index < 0) {
      throw new Error(`Invalid path component: ${part}`)
    }

    components.push({ index, hardened })
  }

  return components
}

export function getMasterKeyFromSeed(seed: Uint8Array): { key: Uint8Array; chainCode: Uint8Array } {
  // HMAC-SHA512(key="ed25519 seed", data=seed)
  const hash = hmac(sha512, ED25519_SEED_KEY, seed)

  return {
    key: hash.slice(0, 32), // First 32 bytes = master key
    chainCode: hash.slice(32, 64), // Last 32 bytes = chain code
  }
}

/**
Derive a child key from parent key and chain code
*
@remarks
Important: Ed25519 SLIP-10 requires all path components to be hardened.
Non-hardened components will derive keys but the results will NOT be compatible
with other SLIP-10 Ed25519 implementations. Always use paths like
m/44'/690'/0'/0'/0' (all components ending with ').
@param parentKey - Parent private key (32 bytes)
@param chainCode - Parent chain code (32 bytes)
@param component - Path component with index and hardened flag
@returns Derived child key and chain code
*/

export function deriveChildKey(
  parentKey: Uint8Array,
  chainCode: Uint8Array,
  component: PathComponent,
): { key: Uint8Array; chainCode: Uint8Array } {
  const data = new Uint8Array(1 + 32 + 4)

  // 0x00 prefix
  data[0] = 0

  // Parent key (32 bytes)
  data.set(parentKey, 1)

  // Index (4 bytes, big-endian)
  let index = component.index
  if (component.hardened) {
    index |= HARDENED_OFFSET
  }
  const view = new DataView(data.buffer)
  view.setUint32(33, index, false) // false = big-endian

  // HMAC-SHA512(key=chainCode, data=data)
  const hash = hmac(sha512, chainCode, data)

  return {
    key: hash.slice(0, 32),
    chainCode: hash.slice(32, 64),
  }
}

/**
 * Derive a private key from seed following a derivation path
 *
 * @param seed - The master seed (from mnemonic)
 * @param path - BIP44 path like "m/44'/690'/0'/0'/0'"
 * @returns 32-byte Ed25519 private key
 *
 * @example
 * ```typescript
 * const seed = mnemonicToSeedSync("your mnemonic here", "")
 * const privateKey = deriveEd25519PrivateKey(seed, "m/44'/690'/0'/0'/0'")
 * ```
 */
export function deriveEd25519PrivateKey(seed: Uint8Array, path: string): Uint8Array {
  // Parse path
  const components = parsePath(path)

  // Get master key from seed
  let { key, chainCode } = getMasterKeyFromSeed(seed)

  // Derive through each path component
  for (const component of components) {
    const derived = deriveChildKey(key, chainCode, component)
    key = derived.key
    chainCode = derived.chainCode
  }

  return key
}
