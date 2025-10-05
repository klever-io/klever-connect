import { WalletError, isNode, isValidAddress } from '@klever/connect-core'
import type { PrivateKey, Signature } from '@klever/connect-crypto'
import { cryptoProvider } from '@klever/connect-crypto'
import { hexEncode } from '@klever/connect-encoding'
import type { IProvider } from '@klever/connect-provider'
import type { Transaction } from '@klever/connect-transactions'

import { BaseWallet } from '../base'

export class NodeWallet extends BaseWallet {
  private _privateKey?: PrivateKey | undefined

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
   * @param clearPrivateKey - Whether to clear the private key from memory (default: false)
   *                          If false, you can reconnect without providing the key again
   *                          If true, you'll need to create a new wallet instance to reconnect
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
   * Set or change the private key
   * Can only be called when wallet is disconnected
   * @param privateKey - Private key as hex string
   */
  setPrivateKey(privateKey: string): void {
    if (this._connected) {
      throw new WalletError('Cannot change private key while connected')
    }

    this.importPrivateKey(privateKey)
  }

  /**
   * Generate a new wallet with random private key
   * @param provider - Provider instance to use
   * @returns New NodeWallet instance with generated key pair
   */
  static async generate(provider: IProvider): Promise<NodeWallet> {
    const keyPair = await cryptoProvider.generateKeyPair()
    const privateKeyHex = hexEncode(keyPair.privateKey.bytes)
    return new NodeWallet(provider, privateKeyHex)
  }
}
