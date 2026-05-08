# `sign-and-verify-message` — Flow #8

Sign arbitrary messages or raw bytes with an Ed25519 private key, verify the
signature with the matching public key, and demonstrate the SDK's tamper
detection (mutating either side of the equation invalidates the signature).

## What you learn

- `crypto.signMessage(bytes, privKey)` (umbrella alias of `cryptoProvider.signMessage`).
- `verifySignature(message, sigBytes, pubKeyBytes)`.
- The SDK uses Ed25519 — signatures are 64 bytes.
- Two flavours of input: a UTF-8 string (encoded via `TextEncoder`) and raw
  bytes (e.g. an auth challenge).
- Tampering with the message OR the signature OR the public key all yield
  `false` from `verifySignature`.

## Run

```bash
npm install
npm start
PRIVATE_KEY=<your hex key> npm start
```

## Tests

```bash
npm test              # mocked, pure crypto
npm run test:testnet  # cross-key verification sanity
```

## Gotchas

- The SDK exposes `crypto` as an alias for its `cryptoProvider`. We import it
  as `kleverCrypto` to avoid colliding with the global Web Crypto we use for
  `getRandomValues` (challenge bytes).
- `TextEncoder` is global in Node 19+ and every browser; use it instead of
  `Buffer.from(s, 'utf8')` to keep `common/` examples isomorphic.
- `signature.bytes` is the raw 64-byte signature; use `.toHex()` or
  `.toBase64()` for transport.
