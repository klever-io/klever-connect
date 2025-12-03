import { WalletError, isNode, isValidAddress } from '@klever/connect-core'
import type { PrivateKey, Signature } from '@klever/connect-crypto'
import {
  cryptoProvider,
  encryptToKeystore,
  type EncryptOptions,
  type Keystore,
} from '@klever/connect-crypto'
import { hexEncode } from '@klever/connect-encoding'
import type { IProvider } from '@klever/connect-provider'
import type { Transaction } from '@klever/connect-transactions'

import { BaseWallet } from '../base'

/**
 * Wallet implementation for Node.js environments
 *
 * NodeWallet provides secure wallet operations in server-side Node.js applications.
 * It uses private key-based signing and is designed for backend services, CLI tools,
 * and automated systems.
 *
 * **Security Considerations:**
 * - Private keys are stored in memory and should be handled with care
 * - Use environment variables or secure key management systems for production
 * - Never expose private keys in logs, error messages, or client-side code
 * - Consider using the `disconnect(true)` option to clear keys from memory when done
 *
 * **Environment:**
 * - Node.js only - will throw error if used in browser environments
 * - Use BrowserWallet for browser/dApp applications
 *
 * @example
 * ```typescript
 * import { KleverProvider } from '@klever/connect-provider'
 * import { NodeWallet } from '@klever/connect-wallet'
 *
 * // Create wallet with private key
 * const provider = new KleverProvider({ network: 'mainnet' })
 * const wallet = new NodeWallet(provider, process.env.PRIVATE_KEY)
 *
 * // Connect and use
 * await wallet.connect()
 * console.log('Address:', wallet.address)
 *
 * // Send a transaction
 * const result = await wallet.transfer({
 *   receiver: 'klv1...',
 *   amount: 1000000, // 1 KLV (6 decimals)
 * })
 * console.log('Transaction hash:', result.hash)
 *
 * // Disconnect and clear private key from memory (recommended for security)
 * await wallet.disconnect(true)
 * ```
 *
 * @example
 * ```typescript
 * // Generate a new random wallet
 * const newWallet = await NodeWallet.generate(provider)
 * await newWallet.connect()
 * console.log('New address:', newWallet.address)
 * ```
 */
export class NodeWallet extends BaseWallet {
  private _privateKey?: PrivateKey | undefined

  /**
   * Create a new NodeWallet instance
   *
   * @param provider - Provider instance for blockchain communication
   * @param privateKey - Optional private key as hex string. Can be set later with setPrivateKey()
   *
   * @throws {WalletError} If used in non-Node.js environment
   * @throws {WalletError} If private key format is invalid
   */
  constructor(provider: IProvider, privateKey?: string) {
    super(provider)

    if (!isNode()) {
      throw new WalletError('NodeWallet can only be used in Node.js environment')
    }

    if (privateKey) {
      this.importPrivateKey(privateKey)
    }
  }

  private importPrivateKey(privateKey: string): void {
    try {
      this._privateKey = cryptoProvider.importPrivateKey(privateKey)
    } catch (error) {
      throw new WalletError(
        `Invalid private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Connect the wallet
   *
   * Derives the public key and address from the private key and marks the wallet as connected.
   * This operation is performed locally without any network calls.
   *
   * @throws {WalletError} If no private key was provided during construction or via setPrivateKey()
   * @throws {WalletError} If the generated address is invalid
   *
   * @fires connect - Emits when successfully connected with { address: string }
   *
   * @example
   * ```typescript
   * const wallet = new NodeWallet(provider, privateKey)
   * await wallet.connect()
   * console.log('Connected:', wallet.address)
   * ```
   */
  async connect(): Promise<void> {
    if (this._connected) {
      return
    }

    if (!this._privateKey) {
      throw new WalletError('No private key provided')
    }

    try {
      // Get public key and address from private key
      const publicKey = await cryptoProvider.getPublicKey(this._privateKey)
      this._publicKey = publicKey.toHex()
      this._address = publicKey.toAddress()

      if (!isValidAddress(this._address)) {
        throw new WalletError('Generated address is invalid')
      }

      this._connected = true
      this.emit('connect', { address: this._address })
    } catch (error) {
      throw new WalletError(
        `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Disconnect from the wallet
   *
   * Clears the connection state and optionally removes the private key from memory.
   *
   * **Security Note:**
   * - By default (clearPrivateKey=false), the private key remains in memory for quick reconnection
   * - For enhanced security, set clearPrivateKey=true to completely remove the key from memory
   * - After clearing the private key, you must create a new wallet instance to reconnect
   *
   * @param clearPrivateKey - Whether to clear the private key from memory (default: false)
   *                          - false: Keep key in memory, can reconnect with connect()
   *                          - true: Remove key from memory, requires new wallet instance
   *
   * @fires disconnect - Emits when disconnected
   *
   * @example
   * ```typescript
   * // Disconnect but keep key for reconnection
   * await wallet.disconnect()
   * await wallet.connect() // Works - key still in memory
   *
   * // Disconnect and clear key (recommended for security)
   * await wallet.disconnect(true)
   * await wallet.connect() // Throws error - key cleared
   * ```
   */
  async disconnect(clearPrivateKey: boolean = false): Promise<void> {
    if (!this._connected) {
      return
    }

    this._connected = false
    this._address = ''
    this._publicKey = ''

    // Optionally clear private key for security
    if (clearPrivateKey) {
      this._privateKey = undefined
    }
    // Note: We keep the private key in memory for potential reconnection

    this.emit('disconnect')
  }

  /**
   * Sign a message with the wallet's private key
   *
   * **SECURITY WARNING:**
   * - Only sign messages from trusted sources
   * - Signing malicious messages can lead to phishing attacks
   * - Never sign messages that look like transactions or authorization requests
   * - Verify the message content before signing
   *
   * The message is signed using the Ed25519 signature scheme. The resulting signature
   * can be verified using the wallet's public key.
   *
   * @param message - Message to sign (string or raw bytes)
   * @returns Signature object with .toHex() and .toBase64() methods
   *
   * @throws {WalletError} If wallet is not connected or private key not available
   *
   * @example
   * ```typescript
   * const message = "Hello, Klever!"
   * const signature = await wallet.signMessage(message)
   *
   * // Get signature in different formats
   * console.log('Hex:', signature.toHex())
   * console.log('Base64:', signature.toBase64())
   *
   * // Verify the signature
   * const isValid = await wallet.verifyMessage(message, signature)
   * console.log('Valid:', isValid) // true
   * ```
   *
   * @example
   * ```typescript
   * // Sign raw bytes
   * const data = new Uint8Array([1, 2, 3, 4])
   * const signature = await wallet.signMessage(data)
   * ```
   */
  async signMessage(message: string | Uint8Array): Promise<Signature> {
    if (!this._connected || !this._privateKey) {
      throw new WalletError('Wallet not connected')
    }

    try {
      const messageBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message

      const signature = await cryptoProvider.signMessage(messageBytes, this._privateKey)
      // Return Signature object - developers can choose .toHex() or .toBase64()
      return signature
    } catch (error) {
      throw new WalletError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Sign a transaction with the wallet's private key
   *
   * **SECURITY WARNING:**
   * - Always verify transaction details before signing
   * - Check recipient address, amount, and contract type
   * - Signing a transaction authorizes it to be broadcasted to the blockchain
   * - Signed transactions cannot be reversed once broadcasted
   *
   * The transaction is signed in-place, modifying the original transaction object
   * with the signature. The same transaction object is returned for convenience.
   *
   * @param tx - Unsigned transaction to sign
   * @returns The same transaction object, now signed
   *
   * @throws {WalletError} If wallet is not connected or private key not available
   *
   * @example
   * ```typescript
   * import { TransactionBuilder } from '@klever/connect-transactions'
   *
   * // Build a transaction
   * const builder = new TransactionBuilder(provider)
   * const unsignedTx = await builder
   *   .transfer({ receiver: 'klv1...', amount: 1000000 })
   *   .sender(wallet.address)
   *   .build()
   *
   * // Sign it
   * const signedTx = await wallet.signTransaction(unsignedTx)
   *
   * // Broadcast
   * const hash = await wallet.broadcastTransaction(signedTx)
   * console.log('Transaction hash:', hash)
   * ```
   */
  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this._connected || !this._privateKey) {
      throw new WalletError('Wallet not connected')
    }

    try {
      // Sign the transaction using the Transaction class method
      await tx.sign(this._privateKey)
      return tx
    } catch (error) {
      throw new WalletError(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Get the private key for internal use by child classes
   *
   * @returns The private key instance or undefined if not set
   * @internal
   */
  protected getPrivateKey(): Uint8Array | undefined {
    return this._privateKey ? new Uint8Array(this._privateKey.bytes) : undefined
  }

  /**
   * Set or change the private key
   *
   * **Security Note:**
   * Can only be called when wallet is disconnected to prevent accidental key changes
   * during active operations.
   *
   * @param privateKey - Private key as hex string
   *
   * @throws {WalletError} If wallet is currently connected
   * @throws {WalletError} If private key format is invalid
   *
   * @example
   * ```typescript
   * const wallet = new NodeWallet(provider) // No key yet
   * wallet.setPrivateKey(process.env.PRIVATE_KEY)
   * await wallet.connect()
   * ```
   */
  setPrivateKey(privateKey: string): void {
    if (this._connected) {
      throw new WalletError('Cannot change private key while connected')
    }

    this.importPrivateKey(privateKey)
  }

  /**
   * Generate a new wallet with a random private key
   *
   * Creates a new wallet instance with a cryptographically secure random private key.
   * The wallet is ready to connect and use immediately.
   *
   * **Important:**
   * - Save the private key securely - it cannot be recovered if lost
   * - Never share the private key with anyone
   * - Use environment variables or secure key management in production
   *
   * @param provider - Provider instance for blockchain communication
   * @returns New NodeWallet instance with generated key pair
   *
   * @example
   * ```typescript
   * import { KleverProvider } from '@klever/connect-provider'
   * import { NodeWallet } from '@klever/connect-wallet'
   *
   * const provider = new KleverProvider({ network: 'testnet' })
   * const wallet = await NodeWallet.generate(provider)
   *
   * await wallet.connect()
   * console.log('New wallet address:', wallet.address)
   *
   * // IMPORTANT: Save the private key securely!
   * // You can extract it before connecting if needed for backup
   * ```
   *
   * @example
   * ```typescript
   * // Generate multiple wallets for testing
   * const wallets = await Promise.all([
   *   NodeWallet.generate(provider),
   *   NodeWallet.generate(provider),
   *   NodeWallet.generate(provider),
   * ])
   *
   * for (const wallet of wallets) {
   *   await wallet.connect()
   *   console.log('Generated address:', wallet.address)
   * }
   * ```
   */
  static async generate(provider: IProvider): Promise<NodeWallet> {
    const keyPair = await cryptoProvider.generateKeyPair()
    const privateKeyHex = hexEncode(keyPair.privateKey.bytes)
    return new NodeWallet(provider, privateKeyHex)
  }

  /**
   * Encrypts the wallet's private key to a keystore format
   *
   * Creates an encrypted keystore (Web3 Secret Storage format) that can be
   * saved to disk and later decrypted using `WalletFactory.fromEncryptedJson()`.
   *
   * **Security Notes:**
   * - Use a strong password with mixed characters, numbers, and symbols
   * - The scryptN parameter controls encryption strength vs speed
   * - Higher scryptN = more secure but slower (default: 262144)
   * - Never store the password with the keystore file
   *
   * @param password - The password to encrypt the keystore
   * @param options - Optional scrypt parameters for encryption strength
   * @param options.scryptN - Work factor (default: 262144, min: 4096)
   * @returns A promise that resolves to the encrypted keystore object
   *
   * @throws {WalletError} If wallet is not connected
   *
   * @example
   * ```typescript
   * const wallet = await NodeWallet.generate(provider)
   * await wallet.connect()
   *
   * // Encrypt with default parameters (most secure)
   * const keystore = await wallet.encrypt('my-secure-password')
   *
   * // Save to file
   * await fs.writeFile('keystore.json', JSON.stringify(keystore, null, 2))
   * ```
   *
   * @example
   * ```typescript
   * // Encrypt with custom parameters (faster, for testing)
   * const testKeystore = await wallet.encrypt('password', {
   *   scryptN: 4096  // Faster but less secure
   * })
   * ```
   */
  async encrypt(password: string, options?: EncryptOptions): Promise<Keystore> {
    if (!this.isConnected() || !this._privateKey) {
      throw new WalletError('Wallet must be connected to encrypt')
    }

    return encryptToKeystore(this._privateKey, password, this._address, options)
  }
}
