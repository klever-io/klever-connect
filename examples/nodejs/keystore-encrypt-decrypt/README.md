# keystore-encrypt-decrypt

Demonstrates the full Web3 Secret Storage round-trip in Node.js using `@klever/connect`:

1. Generate a fresh wallet (`NodeWallet.generate`).
2. Encrypt it to a keystore JSON (`wallet.encrypt(password)`).
3. Persist the JSON to disk with `0o600` permissions.
4. Re-load the JSON from disk and decrypt it (`WalletFactory.fromEncryptedJson`).
5. Confirm the restored address equals the original.

## What you'll learn

- The shape of a Web3 Secret Storage v3 keystore (cipher, KDF, MAC).
- How to tune `scryptN` to balance encryption speed vs strength.
- How `NodeWallet.encrypt` and `WalletFactory.fromEncryptedJson` are mirror operations.
- Why keystore JSON is safe to ship to disk while the password stays out of band.

## Prerequisites

- Node.js 20+ and npm.
- A copy of `.env.example` saved as `.env`, with `KEYSTORE_PASSWORD` set to a strong passphrase.
- No funded wallet, no network call — encrypt/decrypt is fully local.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KEYSTORE_PASSWORD` | yes | — | Passphrase used by scrypt-based KDF. No recovery if lost. |
| `KEYSTORE_PATH` | no | `./wallet.keystore.json` | Where the encrypted JSON is written. |
| `KLV_NETWORK` | no | `testnet` | Network to bind the provider to (irrelevant for encrypt/decrypt itself). |

## Run

```bash
cd examples/nodejs/keystore-encrypt-decrypt
npm install
cp .env.example .env   # then edit KEYSTORE_PASSWORD
npm start
```

See `EXPECTED_OUTPUT.md` for the terminal output you should see.

## Tests

| Command | What it does |
|---|---|
| `npm test` | Runs the mocked unit test (no network, no real crypto). CI-safe. |
| `RUN_TESTNET=1 npm run test:testnet` | Runs the live keystore round-trip with real Ed25519 + scrypt + AES. |

The `*.testnet.test.ts` files are excluded from CI by vitest config and additionally
gated on `RUN_TESTNET=1` so accidental `vitest run` does not execute them.

## Gotchas

- The default `scryptN` is **262144**. Production use should NOT pass `scryptN: 4096`;
  we only do that here so `npm start` runs in well under a second.
- The keystore JSON contains the bech32 address in plaintext. That is by design — it
  identifies the wallet for UX; the secret material is the ciphertext+MAC.
- On Windows the `0o600` file mode is largely advisory. Use ACLs or a secret manager
  for any environment with multiple users.
- `wallet.disconnect(true)` wipes the private key from RAM. Always pair it with the
  successful or failing branch so you don't leak the key on error paths.

## Related flows

- `wallet-create-nodejs` — three ways to construct a `NodeWallet` (env key, generate, factory).
- `hd-wallet-from-mnemonic` (in `common/`) — alternative to keystores for backup.
