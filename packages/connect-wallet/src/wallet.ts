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

export class Wallet extends NodeWallet {
  constructor(privateKey: string, provider?: IProvider) {
    const walletProvider = provider || new KleverProvider()
    super(walletProvider, privateKey)
  }

  get privateKey(): string {
    if (!this['_privateKey']) {
      throw new WalletError('Private key not available - wallet may not be connected')
    }
    return this['_privateKey'].toHex()
  }

  static async createRandom(provider?: IProvider): Promise<Wallet> {
    const keyPair = await cryptoProvider.generateKeyPair()
    const privateKeyHex = hexEncode(keyPair.privateKey.bytes)
    return new Wallet(privateKeyHex, provider)
  }

  static async fromMnemonic(
    mnemonic: string,
    provider?: IProvider,
    options?: MnemonicToKeyOptions,
  ): Promise<Wallet> {
    const privateKey = mnemonicToPrivateKey(mnemonic, options)
    const privateKeyHex = hexEncode(privateKey.bytes)
    return new Wallet(privateKeyHex, provider)
  }

  static async fromEncryptedJson(
    json: Keystore | string,
    password: string,
    provider?: IProvider,
  ): Promise<Wallet> {
    const privateKey = await decryptKeystore(json, password)
    const privateKeyHex = hexEncode(privateKey.bytes)
    return new Wallet(privateKeyHex, provider)
  }

  async encrypt(password: string, options?: EncryptOptions): Promise<Keystore> {
    if (!this.isConnected() || !this['_privateKey']) {
      throw new WalletError('Wallet must be connected to encrypt')
    }

    return encryptToKeystore(this['_privateKey'], password, this.address, options)
  }
}
