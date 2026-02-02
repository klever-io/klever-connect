---
'@klever/connect-contracts': patch
---

Fix encoding of `arrayN<u8>` types in ABI encoder to accept hex strings and `Uint8Array` inputs, with proper validation for length and hex characters
