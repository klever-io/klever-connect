# `key-pair-generate-and-import` — Flow #6

Generate Ed25519 key pairs, import from hex, derive public keys.

## What you learn

- `generateKeyPair()` — async, returns `{ privateKey, publicKey }`.
- `crypto.importPrivateKey(hex)` — re-construct from a 64-char hex secret.
- `crypto.getPublicKey(privKey)` — derive the public key.
- `crypto.signMessage(msg, privKey)` + `verifySignature(msg, sig, pubKey)` —
  full sign / verify round trip.

## Run

```bash
npm install
npm start
PRIVATE_KEY=<your hex key> npm start
```

## Tests

```bash
npm test              # mocked (pure crypto)
npm run test:testnet  # checks distinct keys + cross-key verification fails
```

## Gotchas

- A "private key" in this SDK is the 32-byte Ed25519 seed, hex-encoded — 64
  characters. Don't confuse it with a 64-byte expanded key.
- `crypto` is the umbrella alias for `cryptoProvider`.
- `signMessage` returns a `Signature` whose `.bytes` is 64 bytes (Ed25519
  signature). Use `.toHex()` for transport.
