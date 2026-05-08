# block-monitor (Node.js)

A class-based polling block monitor with `EventEmitter` and a slow-block
alert. Useful as a starting point for indexers, dashboards, and uptime
monitors.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `POLL_INTERVAL_MS` | no | Defaults to 4000. |
| `SLOW_BLOCK_THRESHOLD_MS` | no | Defaults to 30000. |
| `MAX_BLOCKS` | no | Defaults to 5. Set to `0` to run forever. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test                         # mocked poll loop
KLV_LIVE_TESTS=true npm run test:testnet
```

## Gotchas

- The example uses Node's built-in `EventEmitter` rather than `provider.on(...)`
  directly so you can see the polling pattern explicitly. For "I just want
  block events", the `provider.on('block', ...)` flow (see
  `provider-events-subscribe`, flow 55) is shorter.
- `slowBlock` only fires if at least one block has already been observed —
  otherwise we don't have a baseline to compare against.
- Salvages and TS-rewrites `_legacy/nodejs/monitoring/block-monitor.js`.
