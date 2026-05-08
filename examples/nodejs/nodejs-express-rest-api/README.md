# nodejs-express-rest-api (Node.js)

An Express REST server that exposes Klever-blockchain endpoints. Includes a
health check, JSON-safe response handling (bigint-aware), and graceful
shutdown on SIGINT/SIGTERM.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness probe + active network. |
| GET | `/balance?address=…&asset=…` | KLV / KDA balance for an address. |
| GET | `/account?address=…` | Full account state. |
| GET | `/tx/:hash` | Transaction details. |
| POST | `/transfer` | Sign + broadcast a transfer (requires `PRIVATE_KEY` on the server). |

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | only for POST `/transfer` | Hex Ed25519. Don't expose this server publicly with a non-empty key — it can authorize transfers from your address. |
| `PORT` | no | Default 3000. |
| `KLV_NETWORK` | no | Default `testnet`. |

## Run

```bash
npm install
npm start
```

In another terminal:

```bash
curl http://localhost:3000/health
curl 'http://localhost:3000/balance?address=klv1…'
curl -X POST http://localhost:3000/transfer \
    -H 'content-type: application/json' \
    -d '{"to":"klv1BOB…","amount":"1.5"}'
```

## Tests

```bash
npm test                                       # mocked smoke
KLV_LIVE_TESTS=true npm run test:testnet
```

## Gotchas

- `PRIVATE_KEY` lives on the **server**. NEVER ship a server with a real key
  and an open `/transfer` endpoint to the public internet — that's a remote
  signing oracle. Either keep the server private or guard `/transfer` with
  authentication you trust.
- Express's default JSON serializer doesn't know about bigint. We use a custom
  `safeJson()` helper (replacer converts bigint to string) for every response.
- Graceful shutdown is mandatory under PM2 / Docker. The example calls
  `server.close(...)` and force-exits after 10s if shutdown stalls.
- Salvages and TS-rewrites `_legacy/nodejs/server/src/server.js`.
