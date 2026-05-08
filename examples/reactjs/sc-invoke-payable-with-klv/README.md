# `sc-invoke-payable-with-klv` (React)

> Invoke a payable contract endpoint while attaching KLV value.

## Pattern

```ts
contract.invoke('deposit_and_increment', { value: { KLV: parseKLV('1.5') } })
```

`value` is a record keyed by asset id. Pass `KLV` for native; pass other KDA ids to attach KDA tokens; pass both for combined transfers.

## Counter fixture

The fixture must expose a payable variant. The Rust source is at `examples/_fixtures/counter/`. If the fixture's compiled WASM is missing, build it first (see `examples/_fixtures/counter/README.md`).

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **`value` is bigint**, not string. The SDK accepts `bigint` via `parseKLV`. Don't pass JS numbers.
- **The endpoint must be marked payable** in Rust (`#[payable("KLV")]`). If it's not, the chain rejects with `incompatible payment received`.
- **Attaching multiple assets:** `{ value: { KLV: parseKLV('1'), KFI: parseAssetAmount('100', 6) } }`.
