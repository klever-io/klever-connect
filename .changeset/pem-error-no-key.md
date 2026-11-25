---
'@klever/connect-crypto': patch
'@klever/connect-encoding': patch
---

fix(crypto): keep private key material out of PEM loader and hex decode errors

`loadPrivateKeyFromPem` no longer appends the private key in hex to its
address-mismatch error; the message names only the header and derived
addresses. `hexDecode` no longer echoes the invalid characters it rejects,
since its input may be key material. Earlier versions could expose a key
to anything that logs or reports errors.
