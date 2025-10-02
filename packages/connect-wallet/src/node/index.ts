import { WalletError, isNode, isValidAddress } from '@klever/connect-core'
import type { PrivateKey } from '@klever/connect-crypto'
import { cryptoProvider } from '@klever/connect-crypto'
import { hexEncode } from '@klever/connect-encoding'
import type { IProvider } from '@klever/connect-provider'
import type { Transaction } from '@klever/connect-transactions'

import { BaseWallet } from '../base'

export class NodeWallet extends BaseWallet {
  private _privateKey?: PrivateKey

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

  async disconnect(): Promise<void> {
    if (!this._connected) {
      return
    }

    this._connected = false
    this._address = ''
    this._publicKey = ''
    // Note: We keep the private key in memory for potential reconnection

    this.emit('disconnect')
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    if (!this._connected || !this._privateKey) {
      throw new WalletError('Wallet not connected')
    }

    try {
      const messageBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message

      const signature = await cryptoProvider.signMessage(messageBytes, this._privateKey)
      return signature.toHex()
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

  // Additional method to set/change private key
  setPrivateKey(privateKey: string): void {
    if (this._connected) {
      throw new WalletError('Cannot change private key while connected')
    }

    this.importPrivateKey(privateKey)
  }

  // Method to generate a new wallet
  static async generate(provider: IProvider): Promise<NodeWallet> {
    const keyPair = await cryptoProvider.generateKeyPair()
    const privateKeyHex = hexEncode(keyPair.privateKey.bytes)
    return new NodeWallet(provider, privateKeyHex)
  }
}
