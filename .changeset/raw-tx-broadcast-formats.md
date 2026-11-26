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
hex and bytes and send the same JSON body as the `Transaction` object. Bytes
that are not an encoded transaction, or that have no `RawData`, throw a
`ValidationError` before anything is broadcast. The `ValidationError` for input
that is neither JSON nor hex no longer carries that input in its context.

All four accept a signed transaction in any form: a `Transaction` instance
(from connect-transactions or connect-encoding), `tx.toHex()` (with or without
`0x`/`0X`), `tx.toBytes()`, `tx.toJSON()`, a JSON string, or a proto-shaped
`ITransaction` object with `Uint8Array` fields. protobuf.js-style JSON (int64s
as strings, contract types as enum names) is normalized too; it used to be
sent unchanged and rejected by the node. The caller's object is not modified.
`sendRawTransaction(tx)` is now the documented form, since it skips the hex
round trip.

`@klever/connect-encoding` adds `normalizeTransactionJSON`,
`transactionBytesToJSON` and `transactionObjectToJSON`, which convert a
transaction into the node's broadcast format. `Transaction.toJSON` now uses
`normalizeTransactionJSON`, so every input format produces the same body; its
output is unchanged.
