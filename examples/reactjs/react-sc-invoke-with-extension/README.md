# `react-sc-invoke-with-extension`

> ABI-driven mutable contract invoke. Loads the ABI from a fetched JSON and renders a dynamic form.

## Why ABI-driven?

In `sc-invoke-mutable` the ABI is inlined as a TS const. That's fine for one or two endpoints, but real apps:

- Ship the ABI as a static JSON in `public/`
- Load via `fetch('/contract.abi.json')` or `import` of a module
- Render the endpoint list dynamically so the UI stays in sync with the contract

This example shows the full pattern, including:

- ABI fetch with error display
- Filtering out `readonly` endpoints (those are queries, not invokes)
- Per-input type coercion (`u32` -> Number, `u64`/`BigUint` -> bigint, others kept as string)

## Counter ABI

`public/counter.abi.json` is a hand-written stub matching the counter Rust fixture under `examples/_fixtures/counter/`. When the fixture is built, copy `output/counter.abi.json` over the stub to get the canonical schema.

## Run

```bash
npm install
npm run dev          # Vite serves /counter.abi.json from public/
npm test             # mocked default — fetches stubbed
npm run test:testnet
```

## Gotchas

- **`fetch` paths in Vite:** files in `public/` map to `/<filename>` at runtime AND in dev. Don't use a relative path like `./counter.abi.json` — use `/counter.abi.json`.
- **Type coercion is explicit.** The ABI gives you a string type tag (`u32`, `BigUint`, `Address`, `bytes`, …); you decide how each maps to JS. We handle the basic numeric types — extend the switch for more.
- **Address args** typically pass through as `klv1...` strings; the SDK encodes them.
