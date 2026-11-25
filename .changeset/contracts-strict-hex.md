---
'@klever/connect-contracts': patch
---

fix(contracts): reject malformed hex in bytecode, encoders and decoders

`ContractFactory` bytecode, `hexToBytes`, `hexToBase64` and
`decodeResultsWithMetadata` (with `'hex'` encoding) parsed hex with their own
`parseInt` loops. An unparseable pair became `0` (`'zz'` → `[0]`), a valid prefix
was accepted (`'7z'` → `[7]`), and the bytecode and decoder paths did not check
the length, so a corrupted bytecode string could deploy different bytes. They now
use `hexDecode` and throw on odd-length or non-hex input. All of them also accept
a `0X` prefix now.
