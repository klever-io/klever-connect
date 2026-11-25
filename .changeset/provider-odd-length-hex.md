---
'@klever/connect-provider': patch
---

fix(provider): reject odd-length hex in raw transactions

`sendRawTransaction` and `sendRawTransactions` accepted hex of odd length and
decoded the last single digit as its own byte (`'0xabc'` → `[0xab, 0x0c]`), so a
truncated transaction could be broadcast. They now throw a `ValidationError`
before broadcasting.
