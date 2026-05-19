# `balance-read` — Flow #11

Read KLV (and optionally KDA) balances for any address. No wallet, no signing.

## What you learn

- `provider.getBalance(address)` — KLV balance as bigint smallest units.
- `provider.getBalance(address, assetId)` — KDA balance.
- The validate-then-brand idiom: `isValidAddress` then `createKleverAddress`.

## Run

```bash
npm install
cp .env.example .env
# Edit .env — set KLEVER_ADDRESS to the address you want to inspect.
npm start
```

## Tests

```bash
npm test              # mocks the provider so CI runs offline
npm run test:testnet  # hits the live testnet RPC
```

## Gotchas

- The KDA path returns smallest units only; the SDK does NOT auto-format
  unfamiliar tokens because it doesn't know their precision. Fetch the
  per-asset precision via `provider.getAccount(addr)` (see flow #12) and use
  `formatUnits(value, precision)`.
- For real-time updates in a UI, prefer the React hook `useBalance` (which
  polls every 10s) — see `reactjs/react-balance-display/`.
