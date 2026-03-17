# Encoding Examples

Low-level encoding and decoding utilities for working with Klever blockchain data.

## Examples

### `encode-decode.ts` — Encoding helpers

Covers all encoding formats: hex, base58, base64, bech32, and BLAKE2b hashing.

```bash
npx tsx encode-decode.ts
```

### `transaction-encoding.ts` — Transaction serialization

Build an offline transaction, serialize to hex, deserialize it back, then sign and broadcast.

```bash
PRIVATE_KEY=your_hex_key npx tsx transaction-encoding.ts
```

## Key Concepts

### Why encode?

The Klever blockchain uses **Protocol Buffers** for transaction serialization. The encoding package handles all conversions between the JS world and binary wire format.

### Formats at a glance

| Format  | Function                        | Use case                        |
| ------- | ------------------------------- | ------------------------------- |
| Hex     | `hexEncode` / `hexDecode`       | Transaction bytes, private keys |
| Base58  | `base58Encode` / `base58Decode` | Short identifiers               |
| Base64  | `base64Encode` / `base64Decode` | Signatures, API payloads        |
| Bech32  | `bech32Encode` / `bech32Decode` | `klv1…` addresses               |
| BLAKE2b | `hashBlake2b`                   | Transaction hashes              |

### Offline transaction flow

```
TransactionBuilder.buildProto(opts) → tx.toHex() → [store/transmit]
→ Transaction.fromHex(hex) → wallet.signTransaction(tx) → broadcastTransaction(tx)
```

This pattern allows air-gapped signing: build on an online machine, sign offline, broadcast from online machine.
