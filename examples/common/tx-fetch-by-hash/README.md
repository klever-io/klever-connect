# `tx-fetch-by-hash` — Flow #13

Look up an on-chain transaction by hash, render its key fields, and print
the canonical explorer URL.

## What you learn

- `provider.getTransaction(hash)` — full record.
- `provider.getTransactionReceipt(hash)` — receipt with logs/events.
- `provider.getTransactionUrl(hash)` — the explorer URL for whichever network
  the provider is bound to.
- `isTransactionHash` / `createTransactionHash` — validate-and-brand a hash.

## Run

```bash
npm install
cp .env.example .env
# Find a tx hash in https://testnet.klever.finance and put it in KLV_TX_HASH.
npm start
```

## Tests

```bash
npm test              # mocked
npm run test:testnet  # only runs if KLV_TX_HASH is set
```

## Gotchas

- Pending transactions return without a receipt — check `status` first.
- `getTransactionReceipt` may throw if the hash is unknown. Wrap it.
- `getTransactionUrl` stitches together the right explorer host based on the
  provider's network — there's no need to hard-code testnet vs mainnet.
