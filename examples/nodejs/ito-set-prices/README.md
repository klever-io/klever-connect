# ito-set-prices (Node.js)

Stage 2 of the Klever ITO lifecycle. Updates pack prices for an existing ITO
via contractType 16 (`SetITOPrices`).

## Lifecycle

1. `ito-configure` (flow 43)
2. **`ito-set-prices`** ← you are here (flow 44)
3. `ito-buy-from-ito` (flow 45)

## Configuration

See `.env.example`. Required: `PRIVATE_KEY`, `KDA_ID`, `PACK_INFO_JSON`.

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

- This transaction is a *replace*, not a *merge*. The new `packInfo` map
  overwrites the entire price table — any currency keys you omit are lost on
  the chain. Always pass the full set of currencies you support.
- Use this instead of re-issuing `ConfigITO` for price-only updates: it's
  smaller on the wire and clearer in the receipt log.
