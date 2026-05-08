# `ito-buy-from-ito` (React)

> Buy a pack from an Initial Token Offering using `useTransaction({contractType: 17})` with `buyType=1`.

## Background

ITOs share the `Buy` contract (TXType 17) with marketplace listings. The discriminator is the `buyType` field:

| `buyType` | Meaning |
|---:|---|
| `0` | MarketBuy — buy a marketplace listing |
| `1` | ITOBuy — buy a pack from an ITO |

The `id` field is interpreted as the KDA being sold by the ITO; `currencyId` is what the buyer pays with; `amount` is the buyer's spend in smallest-units.

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **`amount` is what you SPEND, not what you receive.** The chain calculates how many destination KDA you get from the ITO config (price per pack).
- **The ITO must be configured** (contractType 15) AND **prices must be set** (16) before any buy will succeed.
- **Currency mismatch** — passing `KLV` if the ITO accepts only `KFI` will fail at execution.
