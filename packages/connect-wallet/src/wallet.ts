import { WalletError } from '@klever/connect-core'
import type { IProvider } from '@klever/connect-provider'
import { KleverProvider } from '@klever/connect-provider'
import { hexEncode } from '@klever/connect-encoding'
import {
  cryptoProvider,
  mnemonicToPrivateKey,
  encryptToKeystore,
  decryptKeystore,
  type MnemonicToKeyOptions,
  type EncryptOptions,
  type Keystore,
} from '@klever/connect-crypto'

import { NodeWallet } from './node'

/**
 * Wallet class for managing accounts.
 *
 * @remarks
 * The Wallet class extends NodeWallet and provides a high-level interface for
 * creating and managing Klever wallets. It supports multiple creation methods:
 * random generation, mnemonic phrases, and encrypted keystore files.
 *
 * @example
 * ```typescript
 * // Create from private key
 * const wallet = new Wallet('0x123...')
 *
 * // Create random wallet
 * const randomWallet = await Wallet.createRandom()
 *
 * // Create from mnemonic
 * const mnemonicWallet = await Wallet.fromMnemonic('your mnemonic phrase here')
 *
 * // Create from encrypted keystore
 * const keystoreWallet = await Wallet.fromEncryptedJson(keystore, 'password')
 * ```
 */
export class DefaultWallet extends NodeWallet {
  /**
   * Creates a new Wallet instance from a private key.
   *
   * @param privateKey - The private key as a hex string
   * @param provider - Optional custom provider (defaults to KleverProvider)
   *
   * @example
   * ```typescript
   * const wallet = new Wallet('0x1234...', customProvider)
   * console.log('Address:', wallet.address)
   * ```
   */
  constructor(privateKey: string, provider?: IProvider) {
    const walletProvider = provider || new KleverProvider()
    super(walletProvider, privateKey)
  }

  /**
   * Gets the wallet's private key as a hex string.
   *
   * @returns The private key in hexadecimal format
   * @throws WalletError if wallet is not connected or private key is not available
   *
   * @example
   * ```typescript
   * const wallet = new Wallet('0x123...')
   * console.log('Private key:', wallet.privateKey)
   * ```
   */
  get privateKey(): string {
    const pkBytes = this.getPrivateKey()
    if (!pkBytes) {
      throw new WalletError('Private key not available - wallet may not be connected')
    }
    return hexEncode(pkBytes)
  }

  /**
   * Creates a new wallet with a randomly generated private key.
   *
   * @param provider - Optional custom provider (defaults to KleverProvider)
   * @returns A promise that resolves to a new Wallet instance
   *
   * @example
   * ```typescript
   * // Create with default provider
   * const wallet = await Wallet.createRandom()
   * console.log('New address:', wallet.address)
   *
   * // Create with custom provider
   * const customWallet = await Wallet.createRandom(myProvider)
   * ```
   */
  static async createRandom(provider?: IProvider): Promise<DefaultWallet> {
    const keyPair = await cryptoProvider.generateKeyPair()
    const privateKeyHex = hexEncode(keyPair.privateKey.bytes)
    return new DefaultWallet(privateKeyHex, provider)
  }

  /**
   * Converts a BIP39 mnemonic phrase to a private key (hex string).
   *
   * @remarks
   * This is a utility method that derives a private key from a mnemonic without
   * creating a wallet instance. Useful when you only need the private key.
   *
   * @param mnemonic - The BIP39 mnemonic phrase (12-24 words)
   * @param options - Optional derivation path and passphrase
   * @returns The private key as a hexadecimal string
   *
   * @example
   * ```typescript
   * // Convert with default derivation path
   * const privateKey = Wallet.mnemonicToPrivateKey('abandon abandon abandon...')
   * console.log('Private key:', privateKey)
   *
   * // Convert with custom derivation path
   * const privateKey2 = Wallet.mnemonicToPrivateKey('abandon abandon abandon...', {
   *   path: "m/44'/690'/0'/0'/1'"
   * })
   *
   * // Convert with passphrase
   * const privateKey3 = Wallet.mnemonicToPrivateKey('abandon abandon abandon...', {
   *   passphrase: 'my-secret-passphrase'
   * })
   * ```
   */
  static mnemonicToPrivateKey(mnemonic: string, options?: MnemonicToKeyOptions): string {
    const privateKey = mnemonicToPrivateKey(mnemonic, options)
    return hexEncode(privateKey.bytes)
  }

  /**
   * Creates a wallet from a BIP39 mnemonic phrase.
   *
   * @param mnemonic - The BIP39 mnemonic phrase (12-24 words)
   * @param provider - Optional custom provider (defaults to KleverProvider)
   * @param options - Optional derivation path and passphrase
   * @returns A promise that resolves to a new Wallet instance
   *
   * @example
   * ```typescript
   * // Create from mnemonic with default derivation path
   * const wallet = await Wallet.fromMnemonic('abandon abandon abandon...')
   *
   * // Create with custom derivation path
   * const wallet2 = await Wallet.fromMnemonic('abandon abandon abandon...', undefined, {
   *   path: "m/44'/690'/0'/0'/1'"
   * })
   *
   * // Create with passphrase
   * const wallet3 = await Wallet.fromMnemonic('abandon abandon abandon...', undefined, {
   *   passphrase: 'my-secret-passphrase'
   * })
   * ```
   */
  static async fromMnemonic(
    mnemonic: string,
    provider?: IProvider,
    options?: MnemonicToKeyOptions,
  ): Promise<DefaultWallet> {
    const privateKeyHex = DefaultWallet.mnemonicToPrivateKey(mnemonic, options)
    return new DefaultWallet(privateKeyHex, provider)
  }

  /**
   * Creates a wallet from an encrypted keystore (Web3 Secret Storage).
   *
   * @param json - The keystore object or JSON string
   * @param password - The password to decrypt the keystore
   * @param provider - Optional custom provider (defaults to KleverProvider)
   * @returns A promise that resolves to a new Wallet instance
   *
   * @throws Error if password is incorrect or keystore is invalid
   *
   * @example
   * ```typescript
   * // From keystore object
   * const wallet = await Wallet.fromEncryptedJson(keystore, 'my-password')
   *
   * // From JSON string
   * const keystoreJson = await fs.readFile('keystore.json', 'utf-8')
   * const wallet2 = await Wallet.fromEncryptedJson(keystoreJson, 'my-password')
   *
   * console.log('Loaded wallet address:', wallet.address)
   * ```
   */
  static async fromEncryptedJson(
    json: Keystore | string,
    password: string,
    provider?: IProvider,
  ): Promise<DefaultWallet> {
    const privateKey = await decryptKeystore(json, password)
    const privateKeyHex = hexEncode(privateKey.bytes)
    return new DefaultWallet(privateKeyHex, provider)
  }

  /**
   * Encrypts the wallet's private key to a keystore format.
   *
   * @param password - The password to encrypt the keystore
   * @param options - Optional scrypt parameters for encryption strength
   * @returns A promise that resolves to the encrypted keystore object
   *
   * @throws WalletError if wallet is not connected
   *
   * @example
   * ```typescript
   * const wallet = await Wallet.createRandom()
   *
   * // Encrypt with default parameters
   * const keystore = await wallet.encrypt('my-secure-password')
   *
   * // Encrypt with custom parameters (faster, less secure)
   * const testKeystore = await wallet.encrypt('password', {
   *   scryptN: 4096
   * })
   *
   * // Save to file
   * await fs.writeFile('keystore.json', JSON.stringify(keystore, null, 2))
   * ```
   */
  async encrypt(password: string, options?: EncryptOptions): Promise<Keystore> {
    const pk = this.getPrivateKey()
    if (!this.isConnected() || !pk) {
      throw new WalletError('Wallet must be connected to encrypt')
    }

    return encryptToKeystore(pk, password, this.address, options)
  }
}
