# marketplace-create (Node.js)

Stage 1 of the Klever marketplace lifecycle. Creates a new marketplace on-chain
via contractType 20 — `CreateMarketplace`.

## Lifecycle

1. **`marketplace-create`** ← you are here (flow 39)
2. `marketplace-list-asset` (flow 40 — Sell)
3. `marketplace-buy-listing` (flow 41 — Buy)
4. `marketplace-cancel-order` (flow 42 — Cancel)

## Configuration

See `.env.example`.

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- A successful broadcast is just an acceptance signal. The marketplace is only
  available for use after the transaction is mined and a receipt yields the
  `marketplaceId`.
- `referralPercentage` is integer basis-points × 100 (250 = 2.50%).
- Different marketplaces can coexist for the same owner — the chain doesn't
  enforce uniqueness on `name` alone, only on the `(owner, name)` pair.
