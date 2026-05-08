# Expected output — `sign-and-verify-message`

## `npm start`

```text
Public key: <64-char hex>

Message         : "Authenticate with Klever dApp"
Signature (hex) : <128-char hex (64-byte signature)>
Signature (b64) : <88-char base64>

verifySignature: true    // expected true
tampered msg   : false    // expected false
tampered sig   : false    // expected false

Challenge sig  : <16-char hex prefix>...

Done.
```

When `PRIVATE_KEY` is set, the public key matches whatever Klever wallet
already shows for that secret.
