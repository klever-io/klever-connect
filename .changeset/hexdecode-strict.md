---
'@klever/connect-encoding': patch
'@klever/connect-crypto': patch
'@klever/connect-transactions': patch
'@klever/connect-wallet': patch
---

fix(encoding): reject malformed hex instead of decoding a valid prefix

`hexDecode` parsed each byte with `parseInt`, which reads a valid prefix and
ignores the rest, so `'7z'` decoded to `[7]`, `'-1'` to `[255]` and `' 7'` to
`[7]`. A mistyped private key passed to `NodeWallet` or `PrivateKeyImpl.fromHex`
therefore imported as a different key without any error. Every byte must now be
exactly two hex digits (after an optional `0x` prefix), or `hexDecode` throws.
This applies wherever `hexDecode` is used: keys, signatures, keystores, PEM
files, `Transaction.fromHex` and `verifyMessage`. `importPrivateKey` no longer
accepts a doubled prefix such as `0x0x`.
