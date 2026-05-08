# nodejs-cli-wallet (Node.js)

A multi-command CLI for the Klever blockchain built on `node:util.parseArgs` —
zero external deps beyond the SDK.

## Commands

| Command | Purpose |
|---|---|
| `balance` | Read KLV / KDA balance for `--address` (or PRIVATE_KEY-derived). |
| `transfer` | Sign and broadcast a transfer (`--to`, `--amount`, optional `--asset`). |
| `account` | Print full account JSON. |
| `faucet` | Request testnet KLV (testnet/devnet only). |
| `tx` | Look up a transaction by `--hash`. |

## Configuration

| Variable | Required for | Notes |
|---|---|---|
| `PRIVATE_KEY` | `transfer`, `faucet` (without `--address`), `balance`/`account` (when no `--address`) | Hex Ed25519. |
| `KLV_NETWORK` | optional | Default network; overridden by `--network`. |

## Run

```bash
npm install
npm start -- balance --address klv1ALICE…
npm start -- transfer --to klv1BOB… --amount 1.5
npm start -- account
npm start -- faucet
npm start -- tx --hash abc123…
npm start -- --help
```

After `npm install` you can also use `npx klever-cli ...` if installed
globally — the `bin` field exposes `klever-cli`.

## Tests

```bash
npm test                                       # mocked
KLV_LIVE_TESTS=true npm run test:testnet
```

## Gotchas

- `parseArgs` requires Node ≥ 18.3. The example is tested on Node ≥ 20.
- Always quote big numbers passed via `--amount` to avoid shell precision
  surprises.
- Faucet endpoints rate-limit per address; expect failure if you call it
  multiple times in quick succession.
- Salvages and TS-rewrites `_legacy/nodejs/cli/bin/klever-cli.js`.
