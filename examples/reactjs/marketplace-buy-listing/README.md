# `marketplace-buy-listing` (React, minimal)

> Single-input form: paste an order ID, click Buy. Useful as the smallest reproducer.

The polished browse-and-buy UX lives in `react-marketplace-buy-listing`. This folder is the educational minimum: one SDK call (`useTransaction({ contractType: TXType.Buy })`).

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- `buyType: 0` is `MarketBuy`. Use `1` for ITO purchases — see `ito-buy-from-ito`.
- `amount` is the asking price in smallest-units (bigint string). Always parse via `parseKLV`.
