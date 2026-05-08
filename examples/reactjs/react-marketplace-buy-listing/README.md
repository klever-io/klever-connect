# `react-marketplace-buy-listing` (polished)

> Browse a marketplace's listings and buy with one click. Companion to the minimal version (`marketplace-buy-listing`).

## What's "polished" here vs minimal

| Aspect | Minimal | Polished |
|---|---|---|
| Listings | User pastes order id manually | Fetched via `provider.call('marketplace/<id>/listings')` |
| UI | Single form | Card-per-listing list |
| Feedback | Inline status text | Toast banner |
| Error handling | Surface error.message | Toast with success vs error styling |

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **API path is illustrative.** Actual marketplace endpoints depend on the network. Inspect your testnet's API docs to confirm `marketplace/<id>/listings` (or adapt the example).
- **Price is bigint** — store it as `bigint` in component state from the start. `formatKLV(price)` for display, `price.toString()` for the tx payload.
- **`buyType: 0`** = MarketBuy. Don't accidentally pass `1` (that's ITO).
