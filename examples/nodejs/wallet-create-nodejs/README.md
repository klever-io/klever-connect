# wallet-create-nodejs

Demonstrates the three canonical ways to construct a `NodeWallet` using the
umbrella `@klever/connect` package:

1. **Env-supplied private key** — `new NodeWallet(provider, KLV_PRIVATE_KEY)`. The
   production path: secrets arrive via environment variable / secret manager.
2. **Random generated** — `NodeWallet.generate(provider)`. Useful for tests, demos,
   and seeding fresh dev accounts.
3. **Env-detecting factory** — `new WalletFactory(provider).createRandom()`. Same
   end result as #2 but goes through the abstraction that would return a
   `BrowserWallet` if run in a browser bundle.

## What you'll learn

- That `NodeWallet`, `BrowserWallet`, and the factory all share the same `Wallet`
  contract: `address`, `publicKey`, `connect`, `disconnect(clearKey?)`, and the
  signing/transfer methods.
- Why `disconnect(true)` matters: it wipes the private key from RAM.
- How `WalletFactory` lets you write isomorphic wallet-creation code.

## Prerequisites

- Node.js 20+ and npm.
- (Optional) a hex-encoded private key in `.env` to exercise Path 1. No funded
  wallet is needed — the example never broadcasts a transaction.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | no | — | If set, Path 1 runs and connects with this key. |
| `KLV_NETWORK` | no | `testnet` | Network for the provider. |

## Run

```bash
cd examples/nodejs/wallet-create-nodejs
npm install
cp .env.example .env   # optionally fill in KLV_PRIVATE_KEY
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked test exercising both `KLV_PRIVATE_KEY` set and unset branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live test confirming generated addresses validate. |

## Gotchas

- Hex private keys must be exactly 64 hex chars (32 bytes). The `0x` prefix is
  optional. An invalid key throws `WalletError: Invalid private key`.
- `wallet.connect()` performs no network call — it only derives the public key.
- `disconnect(false)` keeps the private key in memory for fast reconnection.
  Pass `true` whenever the key is no longer needed.
- `WalletFactory.createRandom` does NOT persist the generated key. If you need it,
  capture it BEFORE calling `disconnect(true)`, e.g. via the keystore-encrypt-decrypt
  example.

## Related flows

- `keystore-encrypt-decrypt` — persist a generated wallet to disk, then restore it.
- `hd-wallet-from-mnemonic` (in `common/`) — derive a wallet from a BIP-39 phrase.
- `send-klv-transfer` — once you have a connected wallet, send the canonical 1 KLV.
