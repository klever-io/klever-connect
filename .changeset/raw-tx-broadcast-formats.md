---
'@klever/connect-provider': patch
'@klever/connect-encoding': minor
'@klever/connect-transactions': patch
---

fix(provider): broadcast hex and byte transactions as the JSON the node accepts

`sendRawTransaction`, `sendRawTransactions`, `broadcastTransaction` and
`broadcastTransactions` posted hex and `Uint8Array` input as a `Uint8Array`,
which `JSON.stringify` writes as an index-keyed object (`{"0":10,"1":32,...}`).
So the documented `provider.sendRawTransaction(tx.toHex())` could not broadcast:
the node only accepts each transaction as a JSON object. These calls now decode
hex and bytes and send the same JSON body as the `Transaction` object.

Input that is not a transaction now throws a `ValidationError` before anything
is broadcast, instead of being posted for the node to reject: bytes that do not
decode, any object without `RawData` (such as `{ tx: 'data' }`), JSON arrays,
`ArrayBuffer`s, number arrays and primitives. These errors do not carry the
rejected input.

All four accept a signed transaction in any form: a `Transaction` instance
(from connect-transactions or connect-encoding), `tx.toHex()` (with or without
`0x`/`0X`), `tx.toBytes()`, `tx.toJSON()`, a JSON string, or a proto-shaped
`ITransaction` object with `Uint8Array` fields. Bytes are recognized from any
realm (an iframe, `vm`, jsdom) and as a `Buffer`. protobuf.js-style JSON
(int64s as strings, contract types as enum names) is normalized too; it used to
be sent unchanged and rejected by the node. The caller's object is not modified.
`sendRawTransaction(tx)` is now the documented form, since it skips the hex
round trip.

`@klever/connect-encoding` adds `normalizeTransactionJSON`,
`transactionBytesToJSON` and `transactionObjectToJSON`, which convert a
transaction into the node's broadcast format. `Transaction.toJSON` now uses
`normalizeTransactionJSON`, so every input format produces the same body.

Every 64-bit integer field (`Nonce`, `KAppFee`, `BandwidthFee`, `KDAFee.Amount`,
`GasLimit`, `GasMultiplier`, `Block`) given as a string must be a plain decimal
that fits a safe integer, or normalization throws naming the field.
`Transaction.toJSON` throws `TransactionError` for such a value, where it used
to send `null`, a hex reading or a rounded number, which changed the signed
data. `GasMultiplier` and `Block` are now sent as numbers, as the node expects;
`toJSON` output is otherwise unchanged.
