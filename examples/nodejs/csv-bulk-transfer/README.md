# csv-bulk-transfer (Node.js)

Read recipients from a CSV file, build a transfer per row, and broadcast in
managed batches via `wallet.broadcastTransactions(...)`.

## CSV format

Header row REQUIRED:

```text
receiver,amount,kda
klv1...,1,
klv1...,5,KFI
```

- `receiver`: bech32 `klv1…` address (validated via `isValidAddress`).
- `amount`: human KLV when `AMOUNT_UNIT=human` (default), raw smallest units
  when `AMOUNT_UNIT=raw`. KDA amounts are always raw.
- `kda` (optional): the asset id. Leave blank for KLV transfers.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `CSV_PATH` | no | Defaults to `./recipients.csv`. |
| `AMOUNT_UNIT` | no | `"human"` (default) or `"raw"`. |
| `BATCH_SIZE` | no | Defaults to 50. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default) — sign every tx but don't broadcast. |

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

- The example parses + validates the ENTIRE CSV before building any transaction.
  This avoids partial broadcasts on malformed input.
- KDA amounts are NOT auto-converted from human-readable. The chain doesn't
  know each KDA's precision until you `provider.getAccount` and read it; that
  per-row I/O would be a footgun in a bulk script. If you need
  human→raw for KDAs, use `parseUnits(amount, decimals)` in your input pipeline.
- Each batch broadcast is a single HTTP round-trip; tune `BATCH_SIZE` to match
  the node's accepted body size.
- Salvages and TS-rewrites `_legacy/nodejs/batch/csv-import.js`.
