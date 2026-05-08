# `react-send-kda-transfer` (polished)

> KDA transfer with a holdings picker. Fetches the connected account's KDA balances via `provider.getAccount(address)` and renders them as a dropdown.

## Pattern

```ts
const acc = await provider.getAccount(address)
// acc.assets is a Record<assetId, { balance, precision, ... }>
const list = Object.entries(acc.assets).map(...)
// then sendKDA({ to, amount: parseUnits(value, precision), kda: assetId })
```

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **Per-asset precision matters.** KLV is 6, but a token might be 0 (NFTs) or any other number. Always use `parseUnits(value, precision)`.
- **`balance` may come back as a string** depending on the API response — always `BigInt(...)` it.
- **NFTs have precision 0.** The amount is just the count (`1`, `2`, etc.).
