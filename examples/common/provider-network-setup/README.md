# `provider-network-setup` — Flow #1

Demonstrates **how to construct a `KleverProvider`** for any of the SDK's
canonical networks plus a fully custom RPC endpoint.

## What you learn

- The four canonical networks: `mainnet`, `testnet`, `devnet`, `local`.
- The `NETWORKS` catalogue — useful for building network pickers.
- `createCustomNetwork({ name, chainId, api, node })` for self-hosted nodes.
- That `KleverProvider` construction is **pure / synchronous** — no network
  call happens until you ask the provider for data.

## Prerequisites

None. The default flow runs purely against the SDK constants and a single
`getNetwork()` call (which does not require a live node).

## Environment variables

| Variable           | Required | Default    | Description                                  |
| ------------------ | -------- | ---------- | -------------------------------------------- |
| `KLV_NETWORK`      | no       | `testnet`  | One of `mainnet` / `testnet` / `devnet` / `local`. |
| `KLV_CUSTOM_RPC`   | no       | (unset)    | If set, also build a custom-RPC provider pointed at it. |

## Run

```bash
npm install
cp .env.example .env  # optional — defaults are fine
npm start
```

## Tests

```bash
# Mocked-provider tests (CI-safe, no network)
npm test

# Live testnet — manual only, excluded from CI
npm run test:testnet
```

## What to expect

See [`EXPECTED_OUTPUT.md`](./EXPECTED_OUTPUT.md) for verbatim console output.

## Gotchas

- `getNetwork()` is async because some SDK transports (websocket / on-chain
  chainId probe) need a round-trip; for the built-in networks it returns
  immediately.
- `createCustomNetwork` does **not** validate the URL or probe the node — make
  sure you've got the right `chainId`, otherwise broadcast txs will fail
  signature verification.
- Switching networks in a long-running app should always be done by creating a
  fresh `KleverProvider` instance and re-instantiating wallets — the SDK does
  not support hot-swapping the URL on an existing provider.
