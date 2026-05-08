# tx-poll-until-confirmed (Node.js)

Wait for a transaction to confirm with a timeout. Useful in CI scripts that
need to gate downstream steps on a transaction landing.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `TX_HASH` | yes | 64-hex transaction hash. |
| `TIMEOUT_MS` | no | Milliseconds. Default 60000. |
| `POLL_INTERVAL_MS` | no | Milliseconds between manual polls. Default 2000. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |

## Run

```bash
npm install
TX_HASH=… npm start
```

## Tests

```bash
npm test
TX_HASH=… npm run test:testnet
```

## Exit codes

- `0` — transaction confirmed (success).
- `1` — transaction failed at chain level, or any unexpected error.
- `2` — timeout reached before confirmation.

## Gotchas

- The provider already implements polling internally — you usually don't need
  to write your own loop. This example shows BOTH the recommended path
  (`provider.waitForTransaction`) and a manual fallback for educational value.
- `TIMEOUT_MS` should be larger than the network's typical block time × the
  required confirmations. On testnet, 60s is generous; mainnet may need 120s+
  for finality.
- Salvages and TS-rewrites `_legacy/nodejs/automation/transaction-watcher.js`.
