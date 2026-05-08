# `format-parse-kda` — Flow #4

Convert any KDA token between human-readable strings and smallest units, given
its precision.

## What you learn

- `parseUnits(value, decimals)` / `formatUnits(value, decimals)` — generic.
- `parseAssetAmount` / `formatAssetAmount` — branded variants for type safety.
- Why you must know each token's precision (the SDK does not look it up for
  you).

## Run

```bash
npm install
npm start
KDA_AMOUNT=1000.5 KDA_PRECISION=8 npm start
```

## Tests

```bash
npm test              # mocked
npm run test:testnet  # walks real assets and confirms round-trip
```

## Where to find precision

Call `provider.getAccount(addr)` — its `assets[]` array carries
`{ assetId, balance, precision }`. Cache the precision per asset; it never
changes after token creation (some governance flows can update it but those
are rare).

## Gotchas

- Adding bigints of different precisions is meaningless; always normalise.
- Trailing zeros are preserved in `formatUnits` only when fewer than the full
  precision are present (see the USDT case where `1000.5` -> `1000.5`, not
  `1000.50000000`).
- For KLV specifically prefer `parseKLV` / `formatKLV` (flow #3).
