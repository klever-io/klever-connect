# `tx-build-modes` — Flow #15

The three ways to build a transaction with `TransactionBuilder`.

## What you learn

- **`build()`** — node-assisted. The provider fetches nonce, fees, chainId
  and returns a fully-encoded `Transaction`. Easiest, requires network.
- **`buildProto({...})`** — fully offline. You supply nonce / chainId / fees;
  the SDK encodes the proto bytes locally with no network call. Use this for
  cold-storage signing.
- **`buildRequest()`** — returns a plain JSON `BuildTransactionRequest`. Use
  to inspect, persist, or pipe to a custom endpoint.

## Run

```bash
npm install
cp .env.example .env
npm start
```

## Tests

```bash
npm test              # mocks the network for build() / buildProto()
npm run test:testnet  # builds against a real testnet endpoint (no broadcast)
```

## Gotchas

- `build()` requires a provider; `buildProto({...})` and `buildRequest()` do
  not. Mixing them up yields confusing TypeScript errors.
- This example does **not** broadcast — that requires signing, which
  requires a private key, which lives in `nodejs/`. See
  `nodejs/send-klv-transfer/` for the full sign + broadcast flow.
- For an explanation of when to use offline build (hardware signing, air-gap),
  see [`../tx-serialize-deserialize/`](../tx-serialize-deserialize/).
