# `react-balance-display`

Display live KLV + KDA balances using the `useBalance()` hook.

## What this shows

- `useBalance(token)` polls every 10 s by default.
- The hook returns `{ balance, isLoading, error, refetch }`.
- Multiple `useBalance` instances run independently (one per card).

## Prereqs

- Node 20+, npm.
- Klever Web Extension installed and unlocked with at least one address.

## Run it

```bash
cd examples/reactjs/react-balance-display
npm install
cp .env.example .env.local
# edit VITE_KLV_KDA_ID if you want a different token displayed.
npm run dev
```

## Tests

```bash
npm test               # mocked useKlever + useBalance
npm run test:testnet   # mounts real KleverProvider (no wallet)
```

## Gotchas

- The 10 s polling interval is hardcoded inside the hook — no configuration.
  For a faster refresh, debounce calls to `refetch()` on a timer of your own.
- Accounts that don't yet exist on-chain return `{ amount: 0n, formatted: '0' }`
  and an empty error — they are not surfaced as a failure.
- The hook tracks `currentNetwork` as a dependency, so switching networks
  immediately triggers a refetch.
