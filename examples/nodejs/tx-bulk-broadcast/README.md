# tx-bulk-broadcast (Node.js)

Build N transactions with manually managed nonces and broadcast them in a
single batch via `wallet.broadcastTransactions(...)`.

## Why

When you need to fan out many transfers (airdrop, payroll, recurring
distributions) in one shot, the naive approach of letting each builder fetch
its own nonce produces duplicate nonces — the chain accepts only one of them.
This example shows the canonical fan-out pattern.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `RECIPIENTS_JSON` | yes | Array of `{ receiver, amount }`. |
| `AMOUNT_UNIT` | no | `"raw"` (default) or `"human"` — when `human`, each amount runs through `parseKLV(...)`. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default) — sign every tx but skip the batch broadcast. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- The chain accepts batches up to a node-configured size cap (typically 100s
  of txs per batch). Splitting is the user's responsibility for huge mailings.
- `broadcastTransactions` is atomic at the wire level (one HTTP request) but
  **not** at the chain level — individual txs in the batch can succeed or fail
  independently. The returned `hashes[]` ordering matches the input.
- If a single transaction in the middle of the batch fails, ALL subsequent
  ones are still queued: the chain will execute them in nonce order, skipping
  the failed one (the nonce gap stalls everything). For strict ordering use
  smaller batches and verify each before moving on.
- This example salvages and TS-rewrites `_legacy/nodejs/batch/bulk-transfer.js`.
