# `hd-wallet-from-mnemonic` — Flow #7

Generate or import a BIP39 mnemonic and derive multiple Klever accounts at
custom BIP44 paths.

## Umbrella import gap

`generateMnemonicPhrase`, `isValidMnemonic`, and `DEFAULT_DERIVATION_PATH` are
NOT (yet) re-exported by `@klever/connect`. This example imports them from
`@klever/connect-crypto` directly with a `// TODO(KLC-2322)` flag.

## What you learn

- `WalletFactory.fromMnemonic(phrase, passphrase?, { path? })` — restore a
  wallet (or derive a sibling) from a mnemonic.
- `generateMnemonicPhrase({ strength: 128 | 256 })` — 12- or 24-word phrases.
- `isValidMnemonic(phrase)` — BIP39 word-list + checksum check.
- The Klever BIP44 path `m/44'/690'/0'/0'/<account>'`.

## Run

```bash
npm install
npm start
KLEVER_MNEMONIC="word1 word2 ..." npm start
```

## Tests

```bash
npm test              # determinism + valid/invalid checks
npm run test:testnet  # round-trips a fresh mnemonic against a live RPC
```

## Gotchas

- The example masks the mnemonic in console output. **Real apps must never
  log mnemonics.** Show them once on creation, then never again.
- `generateMnemonicPhrase` uses a CSPRNG (Crypto API in browsers, `crypto`
  module in Node). Don't seed with `Math.random()`.
- The fifth path component (`'/0'/0'/0'`) is `account / change / address`. By
  convention you bump the last index to derive new addresses for the same
  user.
- Klever's BIP44 coin type is **690** (constant `KLEVER_COIN_TYPE`).
