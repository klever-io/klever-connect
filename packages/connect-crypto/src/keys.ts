import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2'

import { hexEncode, hexDecode, bech32Encode } from '@klever/connect-encoding'
import type { KeyPair, PrivateKey, PublicKey } from './types'

// Configure noble-ed25519 to use sha512
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m))

export class PrivateKeyImpl implements PrivateKey {
  constructor(public readonly bytes: Uint8Array) {
    if (bytes.length !== 32) {
      throw new Error('Private key must be 32 bytes')
    }
  }

  get hex(): string {
    return this.toHex()
  }

  toHex(): string {
    return hexEncode(this.bytes)
  }

  static fromHex(hex: string): PrivateKeyImpl {
    return new PrivateKeyImpl(hexDecode(hex))
  }

  static fromBytes(bytes: Uint8Array): PrivateKeyImpl {
    return new PrivateKeyImpl(bytes)
  }
}

export class PublicKeyImpl implements PublicKey {
  constructor(public readonly bytes: Uint8Array) {
    if (bytes.length !== 32) {
      throw new Error('Public key must be 32 bytes')
    }
  }

  get hex(): string {
    return this.toHex()
  }

  toHex(): string {
    return hexEncode(this.bytes)
  }

  toAddress(): string {
    return bech32Encode(this.bytes)
  }

  static fromHex(hex: string): PublicKeyImpl {
    return new PublicKeyImpl(hexDecode(hex))
  }

  static fromBytes(bytes: Uint8Array): PublicKeyImpl {
    return new PublicKeyImpl(bytes)
  }
}

export async function generateKeyPair(): Promise<KeyPair> {
  const privateKeyBytes = ed.utils.randomPrivateKey()
  const publicKeyBytes = await ed.getPublicKeyAsync(privateKeyBytes)

  return {
    privateKey: new PrivateKeyImpl(privateKeyBytes),
    publicKey: new PublicKeyImpl(publicKeyBytes),
  }
}

export function generateKeyPairSync(): KeyPair {
  const privateKeyBytes = ed.utils.randomPrivateKey()
  const publicKeyBytes = ed.getPublicKey(privateKeyBytes)

  return {
    privateKey: new PrivateKeyImpl(privateKeyBytes),
    publicKey: new PublicKeyImpl(publicKeyBytes),
  }
}

export async function getPublicKeyFromPrivate(privateKey: Uint8Array): Promise<Uint8Array> {
  return ed.getPublicKeyAsync(privateKey)
}

export function getPublicKeyFromPrivateSync(privateKey: Uint8Array): Uint8Array {
  return ed.getPublicKey(privateKey)
}
