# ito-buy-from-ito (Node.js)

Stage 3 of the Klever ITO lifecycle. Buy tokens from an ITO via contractType 17
(`Buy`) with `buyType=1`.

## Lifecycle

1. `ito-configure` (flow 43)
2. `ito-set-prices` (flow 44)
3. **`ito-buy-from-ito`** ← you are here (flow 45)

## Configuration

See `.env.example`. Required: `PRIVATE_KEY`, `KDA_ID`, `AMOUNT`,
`CURRENCY_AMOUNT`.

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

- The `id` field is the **KDA asset id** for ITO buys, NOT an order id.
- `currencyAmount` should equal `pack.price × amount` for the matched pack
  tier; otherwise the chain rejects the buy.
- The ITO must be `status=1` (Active) and within `start/endTime` for buys to
  succeed. If it's whitelisted, the buyer must be on the whitelist (set per
  whitelist rules in `ito-configure`).
- For marketplace listings (NFT/auction), use flow 41 instead.
