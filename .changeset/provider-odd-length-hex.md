---
'@klever/connect-provider': patch
---

fix(provider): reject odd-length hex in raw transactions

`sendRawTransaction` and `sendRawTransactions` accepted hex of odd length and
decoded the last single digit as its own byte (`'0xabc'` → `[0xab, 0x0c]`), so a
truncated transaction could be broadcast. They now throw a `ValidationError`
before broadcasting.

A string is now treated as a JSON transaction only when it parses to an object
or array. Hex made only of digits (`'1234'`) or exponent syntax (`'1e5'`) used to
parse as a JSON number and be broadcast as that number; it is now decoded and
checked as hex. A `0X` prefix is accepted, as in `hexDecode`.
