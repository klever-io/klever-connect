# marketplace-list-asset (Node.js)

Stage 2 of the Klever marketplace lifecycle. Lists an asset for sale via
contractType 18 (`Sell`).

## Lifecycle

1. `marketplace-create` (flow 39)
2. **`marketplace-list-asset`** ← you are here (flow 40)
3. `marketplace-buy-listing` (flow 41)
4. `marketplace-cancel-order` (flow 42)

## Configuration

See `.env.example`. Required: `PRIVATE_KEY`, `MARKETPLACE_ID`, `ASSET_ID`,
`PRICE`. Auction listings additionally require `END_TIME` and (optionally)
`RESERVE_PRICE`.

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

- `MARKETPLACE_ID` is the 64-hex id assigned by the chain after flow 39 mines.
- For NFTs, the `assetId` includes the nonce suffix: `MYNFT-AB12/03`. The
  marketplace can also list fungible KDA tokens.
- Auction `endTime` is **seconds since epoch**, not milliseconds.
- Setting `currencyId` lets you accept a non-KLV currency (e.g. KFI). Make
  sure that currency is enabled on the marketplace.
