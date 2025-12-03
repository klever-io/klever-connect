import { detectEnvironment } from '@klever/connect-core'
import type { IProvider } from '@klever/connect-provider'
import { KleverProvider } from '@klever/connect-provider'
import {
  cryptoProvider,
  mnemonicToPrivateKey as mnemonicToKey,
  decryptKeystore,
  type MnemonicToKeyOptions,
  type Keystore,
} from '@klever/connect-crypto'
import { hexEncode } from '@klever/connect-encoding'

import { BrowserWallet } from './browser'
import { NodeWallet } from './node'
import type { Wallet, WalletConfig, WalletFactory as IWalletFactory } from './types'

/**
 * Factory for creating environment-appropriate wallet instances
 *
 * WalletFactory automatically detects the runtime environment (Node.js, Browser, React Native)
 * and creates the appropriate wallet implementation. This provides a unified API for
 * wallet creation across different platforms.
 *
 * **Automatic Environment Detection:**
 * - Node.js → Creates NodeWallet
 * - Browser → Creates BrowserWallet
 * - React Native → (Future support)
 *
 * **Benefits:**
 * - Write once, run anywhere - same code works in Node.js and browser
 * - Simplifies multi-platform dApp development
 * - Handles environment-specific wallet initialization
 * - Type-safe configuration
 *
 * @example
 * ```typescript
 * import { WalletFactory } from '@klever/connect-wallet'
 * import { KleverProvider } from '@klever/connect-provider'
 *
 * const provider = new KleverProvider({ network: 'mainnet' })
 * const factory = new WalletFactory(provider)
 *
 * // In Node.js, this creates a NodeWallet
 * // In Browser, this creates a BrowserWallet
 * const wallet = await factory.createWallet({
 *   privateKey: process.env.PRIVATE_KEY, // Optional in browser (uses extension)
 *   network: 'mainnet',
 * })
 *
 * await wallet.connect()
 * console.log('Wallet address:', wallet.address)
 * ```
 *
 * @example
 * ```typescript
 * // Browser-specific configuration
 * const wallet = await factory.createWallet({
 *   // No privateKey = uses extension in browser
 *   // With privateKey = uses private key mode
 *   privateKey: '0x123...', // Optional
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Use the convenience function for simpler code
 * import { createWallet } from '@klever/connect-wallet'
 *
 * const wallet = await createWallet({
 *   network: 'testnet',
 *   privateKey: process.env.PRIVATE_KEY,
 * })
 * ```
 */
export class WalletFactory implements IWalletFactory {
  private provider: IProvider

  /**
   * Create a new WalletFactory instance
   *
   * @param provider - Optional provider instance. If not provided, creates a default KleverProvider
   */
  constructor(provider?: IProvider) {
    this.provider = provider || new KleverProvider()
  }

  /**
   * Create a wallet instance appropriate for the current environment
   *
   * Detects the runtime environment and creates:
   * - NodeWallet in Node.js (requires privateKey)
   * - BrowserWallet in browsers (optional privateKey, defaults to extension mode)
   * - Throws error for React Native (not yet implemented)
   *
   * @param config - Optional wallet configuration
   * @param config.privateKey - Private key for wallet initialization (required for Node.js)
   * @param config.pemContent - PEM file content (alternative to privateKey)
   * @param config.pemPassword - Password for encrypted PEM files
   * @param config.network - Network to connect to ('mainnet', 'testnet', etc.)
   * @param config.provider - Override the factory's provider
   *
   * @returns Wallet instance ready to connect
   *
   * @throws {Error} If environment is React Native (not yet supported)
   * @throws {Error} If privateKey is not provided in Node.js environment
   *
   * @example
   * ```typescript
   * // Node.js environment
   * const wallet = await factory.createWallet({
   *   privateKey: process.env.PRIVATE_KEY, // Required
   *   network: 'mainnet',
   * })
   * ```
   *
   * @example
   * ```typescript
   * // Browser environment - Extension mode
   * const wallet = await factory.createWallet({
   *   // No privateKey = uses Klever Extension
   * })
   * ```
   *
   * @example
   * ```typescript
   * // Browser environment - Private key mode
   * const wallet = await factory.createWallet({
   *   privateKey: '0x123...', // Uses private key instead of extension
   * })
   * ```
   */
  async createWallet(config?: WalletConfig): Promise<Wallet> {
    const environment = detectEnvironment()

    // Allow overriding the provider
    if (config?.provider) {
      this.provider = config.provider
    } else if (config?.network) {
      this.provider = new KleverProvider({
        network: config.network,
      })
    }

    switch (environment) {
      case 'browser':
        return this.createBrowserWallet(config)

      case 'node':
        return this.createNodeWallet(config?.privateKey)

      case 'react-native':
        // TODO: Implement React Native wallet
        throw new Error('React Native wallet not implemented yet')

      default:
        throw new Error(`Unsupported environment: ${environment}`)
    }
  }

  private createBrowserWallet(config?: WalletConfig): BrowserWallet {
    return new BrowserWallet(this.provider, config)
  }

  private createNodeWallet(privateKey?: string): NodeWallet {
    if (!privateKey) {
      throw new Error('Private key is required for Node.js environment')
    }
    return new NodeWallet(this.provider, privateKey)
  }

  /**
   * Create a new wallet with a randomly generated private key
   *
   * Creates a wallet appropriate for the current environment:
   * - Node.js → NodeWallet with random key
   * - Browser → BrowserWallet in private key mode with random key
   *
   * **Important:**
   * - Save the private key securely - it cannot be recovered if lost
   * - Never share the private key with anyone
   * - Use environment variables or secure key management in production
   *
   * @param provider - Optional custom provider (defaults to factory's provider)
   * @returns A promise that resolves to a new Wallet instance
   *
   * @example
   * ```typescript
   * const factory = new WalletFactory()
   * const wallet = await factory.createRandom()
   * await wallet.connect()
   * console.log('New address:', wallet.address)
   * ```
   *
   * @example
   * ```typescript
   * // With custom provider
   * const testProvider = new KleverProvider({ network: 'testnet' })
   * const wallet = await factory.createRandom(testProvider)
   * ```
   */
  async createRandom(provider?: IProvider): Promise<Wallet> {
    const walletProvider = provider || this.provider
    const keyPair = await cryptoProvider.generateKeyPair()
    const privateKeyHex = hexEncode(keyPair.privateKey.bytes)

    const environment = detectEnvironment()

    switch (environment) {
      case 'browser':
        return new BrowserWallet(walletProvider, { privateKey: privateKeyHex })

      case 'node':
        return new NodeWallet(walletProvider, privateKeyHex)

      case 'react-native':
        throw new Error('React Native wallet not implemented yet')

      default:
        throw new Error(`Unsupported environment: ${environment}`)
    }
  }

  /**
   * Converts a BIP39 mnemonic phrase to a private key (hex string)
   *
   * This is a utility method that derives a private key from a mnemonic without
   * creating a wallet instance. Useful when you only need the private key.
   *
   * @param mnemonic - The BIP39 mnemonic phrase (12-24 words)
   * @param options - Optional derivation path and passphrase
   * @returns The private key as a hexadecimal string
   *
   * @example
   * ```typescript
   * const factory = new WalletFactory()
   * const privateKey = factory.mnemonicToPrivateKey('abandon abandon abandon...')
   * console.log('Private key:', privateKey)
   * ```
   *
   * @example
   * ```typescript
   * // With custom derivation path
   * const privateKey = factory.mnemonicToPrivateKey('abandon abandon abandon...', {
   *   path: "m/44'/690'/0'/0'/1'"
   * })
   * ```
   */
  mnemonicToPrivateKey(mnemonic: string, options?: MnemonicToKeyOptions): string {
    const privateKey = mnemonicToKey(mnemonic, options)
    return hexEncode(privateKey.bytes)
  }

  /**
   * Create a wallet from a BIP39 mnemonic phrase
   *
   * Creates a wallet appropriate for the current environment:
   * - Node.js → NodeWallet with derived key
   * - Browser → BrowserWallet in private key mode with derived key
   *
   * @param mnemonic - The BIP39 mnemonic phrase (12-24 words)
   * @param provider - Optional custom provider (defaults to factory's provider)
   * @param options - Optional derivation path and passphrase
   * @returns A promise that resolves to a new Wallet instance
   *
   * @example
   * ```typescript
   * const factory = new WalletFactory()
   * const wallet = await factory.fromMnemonic('abandon abandon abandon...')
   * await wallet.connect()
   * console.log('Address:', wallet.address)
   * ```
   *
   * @example
   * ```typescript
   * // With custom derivation path
   * const wallet = await factory.fromMnemonic('abandon abandon abandon...', undefined, {
   *   path: "m/44'/690'/0'/0'/1'"
   * })
   * ```
   *
   * @example
   * ```typescript
   * // With passphrase
   * const wallet = await factory.fromMnemonic('abandon abandon abandon...', undefined, {
   *   passphrase: 'my-secret-passphrase'
   * })
   * ```
   */
  async fromMnemonic(
    mnemonic: string,
    provider?: IProvider,
    options?: MnemonicToKeyOptions,
  ): Promise<Wallet> {
    const walletProvider = provider || this.provider
    const privateKeyHex = this.mnemonicToPrivateKey(mnemonic, options)

    const environment = detectEnvironment()

    switch (environment) {
      case 'browser':
        return new BrowserWallet(walletProvider, { privateKey: privateKeyHex })

      case 'node':
        return new NodeWallet(walletProvider, privateKeyHex)

      case 'react-native':
        throw new Error('React Native wallet not implemented yet')

      default:
        throw new Error(`Unsupported environment: ${environment}`)
    }
  }

  /**
   * Create a wallet from an encrypted keystore (Web3 Secret Storage)
   *
   * Creates a wallet appropriate for the current environment:
   * - Node.js → NodeWallet with decrypted key
   * - Browser → BrowserWallet in private key mode with decrypted key
   *
   * @param json - The keystore object or JSON string
   * @param password - The password to decrypt the keystore
   * @param provider - Optional custom provider (defaults to factory's provider)
   * @returns A promise that resolves to a new Wallet instance
   *
   * @throws Error if password is incorrect or keystore is invalid
   *
   * @example
   * ```typescript
   * const factory = new WalletFactory()
   * const wallet = await factory.fromEncryptedJson(keystore, 'my-password')
   * await wallet.connect()
   * console.log('Loaded wallet address:', wallet.address)
   * ```
   *
   * @example
   * ```typescript
   * // From JSON string
   * const keystoreJson = await fs.readFile('keystore.json', 'utf-8')
   * const wallet = await factory.fromEncryptedJson(keystoreJson, 'my-password')
   * ```
   */
  async fromEncryptedJson(
    json: Keystore | string,
    password: string,
    provider?: IProvider,
  ): Promise<Wallet> {
    const walletProvider = provider || this.provider
    const privateKey = await decryptKeystore(json, password)
    const privateKeyHex = hexEncode(privateKey.bytes)

    const environment = detectEnvironment()

    switch (environment) {
      case 'browser':
        return new BrowserWallet(walletProvider, { privateKey: privateKeyHex })

      case 'node':
        return new NodeWallet(walletProvider, privateKeyHex)

      case 'react-native':
        throw new Error('React Native wallet not implemented yet')

      default:
        throw new Error(`Unsupported environment: ${environment}`)
    }
  }
}

/**
 * Convenience function for creating environment-appropriate wallets
 *
 * This is a simplified wrapper around WalletFactory for quick wallet creation.
 * It automatically detects the environment and creates the appropriate wallet type.
 *
 * **When to use:**
 * - Quick prototyping and testing
 * - Simple applications with one wallet instance
 * - Default provider configuration is acceptable
 *
 * **When to use WalletFactory instead:**
 * - Need to reuse the same provider for multiple wallets
 * - Custom provider configuration required
 * - Creating multiple wallet instances
 *
 * @param config - Optional wallet configuration
 * @param config.privateKey - Private key (required in Node.js, optional in browser)
 * @param config.pemContent - PEM file content (alternative to privateKey)
 * @param config.pemPassword - Password for encrypted PEM files
 * @param config.network - Network to connect to
 * @param config.provider - Custom provider instance
 *
 * @returns Wallet instance appropriate for the current environment
 *
 * @example
 * ```typescript
 * // Simple usage with defaults
 * const wallet = await createWallet({
 *   privateKey: process.env.PRIVATE_KEY,
 * })
 * await wallet.connect()
 * ```
 *
 * @example
 * ```typescript
 * // Browser extension mode
 * const wallet = await createWallet() // No config needed
 * await wallet.connect() // Uses Klever Extension
 * ```
 *
 * @example
 * ```typescript
 * // Custom network
 * const wallet = await createWallet({
 *   network: 'testnet',
 *   privateKey: process.env.TEST_PRIVATE_KEY,
 * })
 * ```
 */
export async function createWallet(config?: WalletConfig): Promise<Wallet> {
  const factory = new WalletFactory()
  return factory.createWallet(config)
}

// Export specific wallet types for advanced users
export { BrowserWallet, NodeWallet }
