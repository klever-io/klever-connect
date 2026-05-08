# marketplace-cancel-order (Node.js)

Stage 4 of the Klever marketplace lifecycle. Cancel an unfilled order via
contractType 19 (`CancelMarketOrder`).

## Lifecycle

1. `marketplace-create` (flow 39)
2. `marketplace-list-asset` (flow 40)
3. `marketplace-buy-listing` (flow 41)
4. **`marketplace-cancel-order`** ← you are here (flow 42)

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Must be the seller who created the order. |
| `ORDER_ID` | yes | The order id from the flow-40 receipt. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default). |

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

- Only the seller can cancel. Any other signer is rejected at consensus.
- Once a buy/bid has fully filled the order, cancellation is no longer possible.
  For partial fills (fungible KDAs) the remaining stock can still be cancelled.
- Cancelling an auction with active bids may incur penalties on some networks
  — check the marketplace policy before cancelling live auctions.
