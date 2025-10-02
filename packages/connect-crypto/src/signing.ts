import * as ed from '@noble/ed25519'

import { hexEncode, hexDecode } from '@klever/connect-encoding'
import type { Signature } from './types'

export class SignatureImpl implements Signature {
  constructor(public readonly bytes: Uint8Array) {
    if (bytes.length !== 64) {
      throw new Error('Signature must be 64 bytes')
    }
  }

  get hex(): string {
    return this.toHex()
  }

  toHex(): string {
    return hexEncode(this.bytes)
  }

  static fromHex(hex: string): SignatureImpl {
    return new SignatureImpl(hexDecode(hex))
  }

  static fromBytes(bytes: Uint8Array): SignatureImpl {
    return new SignatureImpl(bytes)
  }
}

export async function signMessage(
  message: Uint8Array,
  privateKey: Uint8Array,
): Promise<Uint8Array> {
  return ed.signAsync(message, privateKey)
}

export function signMessageSync(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
  return ed.sign(message, privateKey)
}

export async function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): Promise<boolean> {
  try {
    return await ed.verifyAsync(signature, message, publicKey)
  } catch {
    return false
  }
}

export function verifySignatureSync(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): boolean {
  try {
    return ed.verify(signature, message, publicKey)
  } catch {
    return false
  }
}
