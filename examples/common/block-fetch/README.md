# `block-fetch` — Flow #14

Fetch a block by number or `'latest'`, walk its transactions.

## What you learn

- `provider.getBlockNumber()` — current head.
- `provider.getBlock(numberOrHashOr'latest')` — full block payload.
- The `transactions[]` array on a block — useful for indexers.

## Run

```bash
npm install
npm start
KLV_BLOCK_NUMBER=1234567 npm start
```

## Tests

```bash
npm test              # mocked
npm run test:testnet  # fetches a real block
```

## Gotchas

- `getBlock` accepts a hash too — pass a `BlockHash`-typed string for hash
  lookups.
- For real-time block streams, build a polling monitor — see
  `nodejs/block-monitor/`.
