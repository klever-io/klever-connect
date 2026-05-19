# `sc-query-readonly` — Flow #57

Read-only smart-contract call: hit a `readonly` ABI endpoint without building
or signing a transaction.

## What you learn

- `new Contract(address, abi, provider)` — `provider` is enough for read-only
  calls (no signer needed).
- `contract.call('endpointName', ...args)` — routes through
  `provider.queryContract`, returns decoded JS values per the ABI's
  `outputs[].type`.

## Prerequisites

A deployed counter contract. Get one by running `nodejs/sc-deploy/` (which
expects the WASM at `_fixtures/counter/output/counter.wasm`).

## Run

```bash
npm install
cp .env.example .env
# Edit .env — set COUNTER_ADDRESS to your deployed counter.
npm start
```

## Tests

```bash
npm test              # mocks queryContract with a canned u64=42
npm run test:testnet  # only runs if COUNTER_ADDRESS is set
```

## ABI source

This folder bundles a copy of the counter ABI as `src/counter-abi.json` so the
example is self-contained. After running `_fixtures/counter/scripts/build.sh`,
your generated ABI should match this one shape-for-shape; if it doesn't,
update the bundled copy.

## Gotchas

- The ABI's `mutability` field decides which path the SDK takes:
  `readonly` -> `provider.queryContract`. `mutable` -> tx (see
  `nodejs/sc-invoke-mutable/`).
- `contract.call` returns whatever shape the ABI declares. For complex types
  (structs, tuples), expect a JS object; for primitives (`u64`), expect a
  `bigint`/`number`/`string` (version-dependent — wrap in `BigInt()` to
  normalise).
