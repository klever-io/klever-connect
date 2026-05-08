# `account-info` — Flow #12

Fetch a full account snapshot in one RPC: nonce, KLV balance, every KDA
balance with its precision, and any frozen amounts.

## What you learn

- `provider.getAccount(addr)` returns an `IAccount` with everything in one
  payload (much fewer round-trips than calling `getBalance` per asset).
- The `assets[]` array carries the per-asset precision — store it, then format
  with `formatUnits`.
- The `frozenBalance` field is what you have staked / unfreezing.

## Run

```bash
npm install
cp .env.example .env
npm start
```

## Tests

```bash
npm test              # mocks provider with canned data
npm run test:testnet  # hits the real RPC
```

## Gotchas

- `account.balance` is a string of smallest units; cast via `BigInt(...)`
  before doing math.
- Some addresses with very many asset balances paginate (rare); the SDK
  handles pagination internally.
- For real-time updates, prefer the React hook `useBalance` — see
  `reactjs/react-balance-display/`.
