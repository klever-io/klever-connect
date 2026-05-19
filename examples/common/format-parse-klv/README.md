# `format-parse-klv` — Flow #3

Convert KLV between human-readable strings and 6-decimal smallest units.

## What you learn

- `parseKLV('12.345678')` -> `12_345_678n` (bigint smallest units).
- `formatKLV(12_345_678n)` -> `'12.345678'`.
- Why **bigint** is the only safe type for balance math (number loses precision).

## Run

```bash
npm install
npm start
KLV_AMOUNT=42.5 npm start  # custom amount
```

## Tests

```bash
npm test              # mocked, pure-function tests
npm run test:testnet  # round-trips formatKLV against a live RPC balance
```

## Gotchas

- Always pass **strings** to `parseKLV`. Passing a JS `number` invites
  floating-point precision bugs.
- Smallest unit is `1` (== `0.000001 KLV`). Sub-micro amounts are not
  representable on-chain.
- For **other** KDA tokens with different precisions, see
  [`../format-parse-kda/`](../format-parse-kda/).
