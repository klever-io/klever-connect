# ito-configure (Node.js)

Stage 1 of the Klever ITO lifecycle. Configures an ITO via contractType 15
(`ConfigITO`).

## Lifecycle

1. **`ito-configure`** ← you are here (flow 43)
2. `ito-set-prices` (flow 44)
3. `ito-buy-from-ito` (flow 45)

## Configuration

See `.env.example`. Required: `PRIVATE_KEY`, `KDA_ID`. Most of the rest of
the request is optional and only sent when set — same partial-update pattern
as `validator-config`.

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

- `packInfo` is a Record<currencyId, { packs: { amount, price }[] }>. The map
  key is the currency the buyer pays in (e.g. `"KLV"`); the inner array
  defines tiers — each tier specifies how many tokens you get for a given price.
- `status=2` (Paused) is reversible; status=0 (Inactive) usually means the ITO
  is closed for the duration of the configured time window.
- All times are seconds since epoch — never milliseconds.
- This transaction must be signed by the KDA admin / owner address. Other
  signers are rejected.
