# balance-alert-watcher (Node.js)

Poll one or more addresses and emit an alert when the balance changes by at
least `MIN_DELTA` raw smallest units.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `ADDRESSES` | yes | Comma-separated klv1 addresses. |
| `ASSET_ID` | no | Defaults to KLV. |
| `POLL_INTERVAL_MS` | no | Defaults to 8000. |
| `MIN_DELTA` | no | Smallest-units bigint. Default 1. |
| `MAX_POLLS` | no | Default 10. Set to 0 to run forever. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
ADDRESSES=klv1… npm run test:testnet
```

## Gotchas

- `provider.getBalance` returns the value in raw smallest units. Always
  compare deltas as `bigint`, never as `Number` — JS numbers lose precision at
  9+ digits of token quantities.
- Watching many addresses with a small interval can hit rate limits. Bump the
  interval if you see HTTP 429 responses.
- Salvages and TS-rewrites `_legacy/nodejs/automation/balance-alert.js`.
