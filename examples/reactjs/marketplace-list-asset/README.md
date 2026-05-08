# `marketplace-list-asset` (React)

> List an asset on a Klever marketplace using `useTransaction` + extension signing.

## What it shows

A form that creates a `Sell` contract (`TXType.Sell` = 18) via `useTransaction`. The user provides:

- Asset ID (e.g. `KFI` or an NFT like `NFT/01`)
- Marketplace ID (numeric)
- Price in KLV (parsed via `parseKLV`)
- Listing duration in days (converted to an Unix end-time epoch)

On submit, the Klever Web Extension prompts for signature, the transaction is broadcast, and the resulting hash is rendered.

## Prerequisites

- Klever Web Extension installed and a testnet account with KLV for fees.
- A marketplace already exists. Create one with `marketplace-create` (Node example) or supply `VITE_MARKETPLACE_ID`.
- An asset you actually own (KDA fungible or NFT).

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # mocked vitest run (CI)
npm run test:testnet # local testnet — needs nothing extra; smoke-mounts only
```

## Gotchas

- **Price is bigint smallest-units.** `parseKLV('5')` -> `'5000000'` (6 decimals). Don't pass JS floats.
- **`endTime` is seconds, not ms.** A common bug: passing `Date.now()` directly (= ms). We use `Math.floor(Date.now() / 1000) + days * 86400`.
- **`marketType: 0`** is fixed-price; auctions use `1`.
- **Currency = KLV by default.** To list against another KDA, set `currencyId` to that asset id.
