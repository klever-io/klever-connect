/**
 * Encoding Utilities Example
 *
 * Demonstrates the encoding/decoding helpers available in the SDK:
 * - Hex encode/decode
 * - Base58 encode/decode
 * - Base64 encode/decode
 * - Bech32 address encode/decode
 * - BLAKE2b hashing
 * - encodeHex for function signatures
 */

import {
  hexEncode,
  hexDecode,
  base58Encode,
  base58Decode,
  base64Encode,
  base64Decode,
  bech32Encode,
  bech32Decode,
  encodeHex,
  hashBlake2b,
} from '@klever/connect-encoding'

// --- Hex ---
const raw = new Uint8Array([1, 2, 3, 255, 0, 128])
const hex = hexEncode(raw)
console.log('Hex encoded:', hex) // "010203ff0080"

const decoded = hexDecode(hex)
console.log('Hex decoded:', decoded) // Uint8Array [1, 2, 3, 255, 0, 128]

// hexDecode accepts optional "0x" prefix
const fromPrefixed = hexDecode('0x' + hex)
console.log('From prefixed hex:', fromPrefixed)

// --- Base58 ---
const b58 = base58Encode(raw)
console.log('Base58 encoded:', b58)
console.log('Base58 decoded:', base58Decode(b58))

// --- Base64 ---
const b64 = base64Encode(raw)
console.log('Base64 encoded:', b64)
console.log('Base64 decoded:', base64Decode(b64))

// --- Bech32 (Klever addresses) ---
// Klever addresses are bech32-encoded 32-byte public key hashes
const pubKeyHash = new Uint8Array(32).fill(0) // sample 32-byte hash
const address = bech32Encode(pubKeyHash)
console.log('Bech32 address:', address) // klv1...

const { data: recovered } = bech32Decode(address)
console.log('Bech32 decoded length:', recovered.length) // 32

// --- encodeHex (UTF-8 string → 0x-prefixed hex) ---
// Used for encoding smart contract function names
const fnSig = encodeHex('transfer')
console.log('Function signature hex:', fnSig) // "0x7472616e73666572"

// --- BLAKE2b hash ---
const data = new TextEncoder().encode('Hello, Klever!')
const hash = hashBlake2b(data)
console.log('BLAKE2b hash (32 bytes):', hexEncode(hash))

// Custom output length
const hash20 = hashBlake2b(data, 20)
console.log('BLAKE2b hash (20 bytes):', hexEncode(hash20))
