# marketplace-buy-listing (Node.js)

Stage 3 of the Klever marketplace lifecycle. Buy a listing (or place an
auction bid) via contractType 17 (`Buy`).

## Lifecycle

1. `marketplace-create` (flow 39)
2. `marketplace-list-asset` (flow 40)
3. **`marketplace-buy-listing`** ← you are here (flow 41)
4. `marketplace-cancel-order` (flow 42)

## Configuration

See `.env.example`.

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Buyer's hex Ed25519 key. |
| `BUY_TYPE` | no | `0` (market — default) or `1` (ITO — prefer flow 45). |
| `ORDER_ID` | yes | Order id from flow 40's receipt. |
| `CURRENCY_ID` | no | Defaults to listing's currency. |
| `AMOUNT` | no | Quantity in raw smallest units (NFTs typically `1`). |
| `CURRENCY_AMOUNT` | yes | Total currency the buyer commits, in raw smallest units. |

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

- For BuyItNow listings, `currencyAmount` must equal the listing price. The
  chain rejects under-payment.
- For auctions, `currencyAmount` is the bid; it must beat the reserve and
  current high bid.
- Buying an NFT consumes the entire listing (`amount` = 1 by convention). For
  fungible KDAs, `amount` is the quantity bought from the listing's stock.
- This example is the marketplace path. For ITOs use the dedicated flow 45
  (`ito-buy-from-ito`).
