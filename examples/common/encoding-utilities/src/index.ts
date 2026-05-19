/**
 * Flow #5 — encoding-utilities
 *
 * Demonstrates the encoding/decoding helpers available in the SDK:
 *   - hex (encode/decode, with/without 0x prefix)
 *   - base58 (the Bitcoin/Klever flavour)
 *   - base64 (standard, cross-platform)
 *   - bech32 (the Klever address format)
 *   - encodeHex (UTF-8 -> 0x-prefixed hex, used for SC function names)
 *   - hashBlake2b (the SDK's hash of choice)
 *
 * IMPORTANT — umbrella import gap.
 *   These helpers live in `@klever/connect-encoding` and are NOT (yet) re-
 *   exported by the umbrella `@klever/connect`. Per the settled-decision rule
 *   (FLOW-INVENTORY §6.1 Q6), examples should import from the umbrella; this
 *   one example is a documented exception until a follow-up PR adds the
 *   re-exports. See the TODO below.
 */

// TODO(KLC-2322): once the umbrella re-exports these helpers, switch this
//                 import back to `from '@klever/connect'`.
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

async function main(): Promise<void> {
  console.log('Encoding utilities demo\n')

  // --- Hex -------------------------------------------------------------------
  // hexEncode: Uint8Array -> lowercase hex string (no 0x prefix).
  // hexDecode: hex string -> Uint8Array. Accepts an optional 0x prefix.
  const raw = new Uint8Array([1, 2, 3, 255, 0, 128])
  const hex = hexEncode(raw)
  console.log(`  hexEncode([1,2,3,255,0,128]) = "${hex}"`)
  console.log(`  hexDecode("${hex}")          = [${Array.from(hexDecode(hex)).join(',')}]`)
  console.log(`  hexDecode("0x${hex}")        = [${Array.from(hexDecode('0x' + hex)).join(',')}]`)

  // --- Base58 ----------------------------------------------------------------
  const b58 = base58Encode(raw)
  console.log(`\n  base58Encode = "${b58}"`)
  console.log(`  base58Decode = [${Array.from(base58Decode(b58)).join(',')}]`)

  // --- Base64 ----------------------------------------------------------------
  const b64 = base64Encode(raw)
  console.log(`\n  base64Encode = "${b64}"`)
  console.log(`  base64Decode = [${Array.from(base64Decode(b64)).join(',')}]`)

  // --- Bech32 (Klever addresses) --------------------------------------------
  // Klever addresses are bech32-encoded 32-byte public-key hashes.
  // Default prefix is `klv`.
  const pubKeyHash = new Uint8Array(32).fill(0)
  const address = bech32Encode(pubKeyHash)
  console.log(`\n  bech32Encode(zero 32 bytes) = "${address}"`)
  const { data: recovered } = bech32Decode(address)
  console.log(`  bech32Decode(...) -> ${recovered.length}-byte buffer`)

  // --- encodeHex (UTF-8 -> 0x-prefixed hex) ---------------------------------
  // Used to encode smart-contract function names: the bytecode expects the
  // function selector as a UTF-8 string, hex-encoded.
  const fnSig = encodeHex('transfer')
  console.log(`\n  encodeHex("transfer") = "${fnSig}"`)
  console.log(`  encodeHex("get_value") = "${encodeHex('get_value')}"`)

  // --- BLAKE2b hash ----------------------------------------------------------
  // Default is 32 bytes (256 bits). You can request a shorter digest if you need it.
  const data = new TextEncoder().encode('Hello, Klever!')
  console.log(`\n  hashBlake2b("Hello, Klever!", 32 bytes) = ${hexEncode(hashBlake2b(data))}`)
  console.log(`  hashBlake2b("Hello, Klever!", 20 bytes) = ${hexEncode(hashBlake2b(data, 20))}`)

  console.log('\nDone.')
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
