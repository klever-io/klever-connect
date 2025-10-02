import { bech32Decode, bech32Encode } from '@klever/connect-encoding'
import {
  PrivateKeyImpl,
  PublicKeyImpl,
  generateKeyPair as genKeyPair,
  getPublicKeyFromPrivate,
} from './keys'
import { loadPrivateKeyFromPem, loadPrivateKeyFromPemFile } from './pem'
import { SignatureImpl, signMessage as sign, verifySignature as verify } from './signing'
import type {
  CryptoProvider,
  KeyPair,
  PrivateKey,
  PublicKey,
  Signature,
  LoadPemOptions,
} from './types'

export class DefaultCryptoProvider implements CryptoProvider {
  async generateKeyPair(): Promise<KeyPair> {
    return genKeyPair()
  }

  importPrivateKey(key: string | Uint8Array): PrivateKey {
    if (typeof key === 'string') {
      // Remove any 0x prefix if present
      const cleanKey = key.startsWith('0x') ? key.slice(2) : key
      return PrivateKeyImpl.fromHex(cleanKey)
    }
    return PrivateKeyImpl.fromBytes(key)
  }

  async getPublicKey(privateKey: PrivateKey): Promise<PublicKey> {
    const pubKeyBytes = await getPublicKeyFromPrivate(privateKey.bytes)
    return PublicKeyImpl.fromBytes(pubKeyBytes)
  }

  async signMessage(message: Uint8Array, privateKey: PrivateKey): Promise<Signature> {
    const signatureBytes = await sign(message, privateKey.bytes)
    return SignatureImpl.fromBytes(signatureBytes)
  }

  async verifySignature(
    message: Uint8Array,
    signature: Signature,
    publicKey: PublicKey,
  ): Promise<boolean> {
    return verify(message, signature.bytes, publicKey.bytes)
  }

  async addressToBytes(address: string): Promise<Uint8Array> {
    const { data } = bech32Decode(address)
    return data
  }

  async bytesToAddress(bytes: Uint8Array): Promise<string> {
    return bech32Encode(bytes, 'klv')
  }

  async sign(data: Uint8Array, privateKeyHex: string): Promise<Uint8Array> {
    const privateKey = this.importPrivateKey(privateKeyHex)
    const signature = await this.signMessage(data, privateKey)
    return signature.bytes
  }

  async importPrivateKeyFromPem(pemContent: string, options?: LoadPemOptions): Promise<PrivateKey> {
    const { privateKey } = await loadPrivateKeyFromPem(pemContent, options)
    return PrivateKeyImpl.fromBytes(privateKey)
  }

  async importPrivateKeyFromPemFile(
    filePath: string,
    options?: LoadPemOptions,
  ): Promise<PrivateKey> {
    const { privateKey } = await loadPrivateKeyFromPemFile(filePath, options)
    return PrivateKeyImpl.fromBytes(privateKey)
  }
}

export const cryptoProvider = new DefaultCryptoProvider()
