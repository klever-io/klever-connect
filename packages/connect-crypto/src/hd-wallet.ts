import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { HDKey } from '@scure/bip32'
import { PrivateKeyImpl } from './keys'
import type { PrivateKey } from './types'

export const DEFAULT_DERIVATION_PATH = "m/44'/1'/0'/0/0"

export const KLEVER_COIN_TYPE = 1

export type MnemonicStrength = 128 | 160 | 192 | 224 | 256

export interface GenerateMnemonicOptions {
  strength?: MnemonicStrength
}

export interface MnemonicToKeyOptions {
  path?: string
  passphrase?: string
}

export function generateMnemonicPhrase(options: GenerateMnemonicOptions = {}): string {
  const { strength = 128 } = options

  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error('Invalid strength. Must be 128, 160, 192, 224, or 256')
  }

  return generateMnemonic(wordlist, strength)
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist)
}

export function mnemonicToPrivateKey(
  mnemonic: string,
  options: MnemonicToKeyOptions = {},
): PrivateKey {
  const { path = DEFAULT_DERIVATION_PATH, passphrase = '' } = options

  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase')
  }

  const seed = mnemonicToSeedSync(mnemonic, passphrase)

  const masterKey = HDKey.fromMasterSeed(seed)

  const childKey = masterKey.derive(path)

  if (!childKey.privateKey) {
    throw new Error('Failed to derive private key from path')
  }

  if (childKey.privateKey.length !== 32) {
    throw new Error(`Invalid derived key length: ${childKey.privateKey.length}`)
  }

  return PrivateKeyImpl.fromBytes(childKey.privateKey)
}

export function deriveMultipleKeys(
  mnemonic: string,
  count: number,
  options: MnemonicToKeyOptions = {},
): PrivateKey[] {
  if (count < 1) {
    throw new Error('Count must be at least 1')
  }

  const { path = DEFAULT_DERIVATION_PATH, passphrase } = options

  const pathParts = path.split('/')
  const basePath = pathParts.slice(0, -1).join('/')
  const startIndex = parseInt(pathParts[pathParts.length - 1] || '0', 10)

  const keys: PrivateKey[] = []

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

  return `m/44'/${KLEVER_COIN_TYPE}'/${account}'/${change}/${index}`
}
