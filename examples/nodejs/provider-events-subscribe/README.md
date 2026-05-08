# provider-events-subscribe (Node.js)

Subscribe to provider events via `provider.on('block', ...)`,
`provider.on('pending', ...)`, etc.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `KLV_NETWORK` | no | Defaults to `testnet`. WS only on `local`. |
| `RUN_FOR_MS` | no | Defaults to 20000. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
KLV_LIVE_TESTS=true npm run test:testnet
```

## Gotchas

- The WS endpoint is configured only for the `local` network. On testnet /
  mainnet the SDK falls back to internal polling — your event listeners still
  fire, but `pending` events may be empty (mempool isn't usually exposed
  publicly).
- Always `removeAllListeners()` (or `off`) on shutdown — the polling loop
  holds references to your callbacks and will keep firing across reloads.
- The provider's `connect()` activates the transport. Without it, the
  listeners are wired but no events fire.
