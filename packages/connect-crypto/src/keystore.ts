import { hexDecode, hexEncode } from '@klever/connect-encoding'
import { scrypt } from '@noble/hashes/scrypt'
import { sha256 } from '@noble/hashes/sha2'
import { randomBytes } from '@noble/hashes/utils'
import { PrivateKeyImpl } from './keys'
import type { PrivateKey } from './types'

export interface Keystore {
  version: 3
  id: string
  address: string
  crypto: {
    ciphertext: string
    cipherparams: {
      iv: string
    }
    cipher: 'aes-128-ctr'
    kdf: 'scrypt'
    kdfparams: {
      dklen: number
      salt: string
      n: number
      r: number
      p: number
    }
    mac: string
  }
}

export interface EncryptOptions {
  scryptN?: number
  scryptR?: number
  scryptP?: number
}

export const DEFAULT_SCRYPT_PARAMS = {
  n: 262144,
  r: 8,
  p: 1,
  dklen: 32,
}

function generateUUID(): string {
  const bytes = randomBytes(16)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  bytes[8] = (bytes[8]! & 0x3f) | 0x80

  const hex = hexEncode(bytes)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

async function aes128CtrEncrypt(
  data: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'AES-CTR' },
    false,
    ['encrypt'],
  )

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      counter: iv.buffer as ArrayBuffer,
      length: 128,
    },
    cryptoKey,
    data.buffer as ArrayBuffer,
  )

  return new Uint8Array(encrypted)
}

async function aes128CtrDecrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'AES-CTR' },
    false,
    ['decrypt'],
  )

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter: iv.buffer as ArrayBuffer,
      length: 128,
    },
    cryptoKey,
    ciphertext.buffer as ArrayBuffer,
  )

  return new Uint8Array(decrypted)
}

export async function encryptToKeystore(
  privateKey: PrivateKey,
  password: string,
  address: string,
  options: EncryptOptions = {},
): Promise<Keystore> {
  const {
    scryptN = DEFAULT_SCRYPT_PARAMS.n,
    scryptR = DEFAULT_SCRYPT_PARAMS.r,
    scryptP = DEFAULT_SCRYPT_PARAMS.p,
  } = options

  if (scryptN <= 0 || (scryptN & (scryptN - 1)) !== 0) {
    throw new Error('scryptN must be a power of 2')
  }
  if (scryptR <= 0 || scryptP <= 0) {
    throw new Error('scryptR and scryptP must be positive')
  }

  const salt = randomBytes(32)
  const iv = randomBytes(16)

  const derivedKey = scrypt(password, salt, {
    N: scryptN,
    r: scryptR,
    p: scryptP,
    dkLen: DEFAULT_SCRYPT_PARAMS.dklen,
  })

  const encryptionKey = derivedKey.slice(0, 16)

  const ciphertext = await aes128CtrEncrypt(privateKey.bytes, encryptionKey, iv)

  const macData = new Uint8Array(derivedKey.length - 16 + ciphertext.length)
  macData.set(derivedKey.slice(16), 0)
  macData.set(ciphertext, derivedKey.length - 16)
  const mac = sha256(macData)

  const keystore: Keystore = {
    version: 3,
    id: generateUUID(),
    address: address.replace(/^klv1?/, ''),
    crypto: {
      ciphertext: hexEncode(ciphertext),
      cipherparams: {
        iv: hexEncode(iv),
      },
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      kdfparams: {
        dklen: DEFAULT_SCRYPT_PARAMS.dklen,
        salt: hexEncode(salt),
        n: scryptN,
        r: scryptR,
        p: scryptP,
      },
      mac: hexEncode(mac),
    },
  }

  return keystore
}

export async function decryptKeystore(
  keystore: Keystore | string,
  password: string,
): Promise<PrivateKey> {
  const ks: Keystore = typeof keystore === 'string' ? JSON.parse(keystore) : keystore

  if (ks.version !== 3) {
    throw new Error('Unsupported keystore version: ' + String(ks.version))
  }

  if (ks.crypto.cipher !== 'aes-128-ctr') {
    throw new Error('Unsupported cipher: ' + String(ks.crypto.cipher))
  }

  if (ks.crypto.kdf !== 'scrypt') {
    throw new Error('Unsupported KDF: ' + String(ks.crypto.kdf))
  }

  const { ciphertext, cipherparams, kdfparams, mac } = ks.crypto

  const ciphertextBytes = hexDecode(ciphertext)
  const iv = hexDecode(cipherparams.iv)
  const salt = hexDecode(kdfparams.salt)
  const macBytes = hexDecode(mac)

  const derivedKey = scrypt(password, salt, {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    dkLen: kdfparams.dklen,
  })

  const macData = new Uint8Array(derivedKey.length - 16 + ciphertextBytes.length)
  macData.set(derivedKey.slice(16), 0)
  macData.set(ciphertextBytes, derivedKey.length - 16)
  const computedMac = sha256(macData)

  let macMatch = true
  for (let i = 0; i < macBytes.length; i++) {
    if (macBytes[i] !== computedMac[i]) {
      macMatch = false
    }
  }

  if (!macMatch) {
    throw new Error('Invalid password or corrupted keystore (MAC verification failed)')
  }

  const encryptionKey = derivedKey.slice(0, 16)
  const privateKeyBytes = await aes128CtrDecrypt(ciphertextBytes, encryptionKey, iv)

  if (privateKeyBytes.length !== 32) {
    throw new Error(`Invalid private key length: ${privateKeyBytes.length}`)
  }

  return PrivateKeyImpl.fromBytes(privateKeyBytes)
}

export async function isPasswordCorrect(
  keystore: Keystore | string,
  password: string,
): Promise<boolean> {
  try {
    const ks: Keystore = typeof keystore === 'string' ? JSON.parse(keystore) : keystore

    const { ciphertext, kdfparams, mac } = ks.crypto
    const ciphertextBytes = hexDecode(ciphertext)
    const salt = hexDecode(kdfparams.salt)
    const macBytes = hexDecode(mac)

    const derivedKey = scrypt(password, salt, {
      N: kdfparams.n,
      r: kdfparams.r,
      p: kdfparams.p,
      dkLen: kdfparams.dklen,
    })

    const macData = new Uint8Array(derivedKey.length - 16 + ciphertextBytes.length)
    macData.set(derivedKey.slice(16), 0)
    macData.set(ciphertextBytes, derivedKey.length - 16)
    const computedMac = sha256(macData)

    for (let i = 0; i < macBytes.length; i++) {
      if (macBytes[i] !== computedMac[i]) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}
