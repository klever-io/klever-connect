export interface KeyPair {
  privateKey: PrivateKey
  publicKey: PublicKey
}

export interface PrivateKey {
  bytes: Uint8Array
  hex: string
  toHex(): string
}

export interface PublicKey {
  bytes: Uint8Array
  hex: string
  toHex(): string
  toAddress(): string
}

export interface Signature {
  bytes: Uint8Array
  hex: string
  toHex(): string
}

export interface SignableMessage {
  toBytes(): Uint8Array
}

export interface LoadPemOptions {
  password?: string
  index?: number
}

export interface CryptoProvider {
  generateKeyPair(): Promise<KeyPair>
  importPrivateKey(key: string | Uint8Array): PrivateKey
  getPublicKey(privateKey: PrivateKey): Promise<PublicKey>
  signMessage(message: Uint8Array, privateKey: PrivateKey): Promise<Signature>
  verifySignature(message: Uint8Array, signature: Signature, publicKey: PublicKey): Promise<boolean>
  addressToBytes(address: string): Promise<Uint8Array>
  bytesToAddress(bytes: Uint8Array): Promise<string>
  sign(data: Uint8Array, privateKeyHex: string): Promise<Uint8Array>
  importPrivateKeyFromPem?(pemContent: string, options?: LoadPemOptions): Promise<PrivateKey>
  importPrivateKeyFromPemFile?(filePath: string, options?: LoadPemOptions): Promise<PrivateKey>
}
