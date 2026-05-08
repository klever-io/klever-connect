# `react-account-changed-listener`

> Re-render the dApp when the user switches account in the Klever Web Extension.

## What this example shows

`BrowserWallet` (the wallet that `KleverProvider` instantiates in the browser)
emits an `'accountChanged'` event whenever the extension reports a new active
account. This example wires a listener via `wallet.on('accountChanged', ...)`,
maintains a small log of account switches, and re-fetches the address-bound
balance whenever a switch happens.

## Why it matters

If your app caches anything keyed by address — balance, NFT inventory,
permissions, session tokens — that cache becomes stale the moment the user
clicks "switch account" in the extension. The provider already updates its
own internal `address` state, but app-level caches need an explicit listener.

## Pattern

```tsx
useEffect(() => {
  if (!wallet) return
  const handler = (next) => {
    refetchEverythingScopedTo(prevAddress)
  }
  wallet.on('accountChanged', handler)
  return () => wallet.off('accountChanged', handler)
}, [wallet])
```

## Prerequisites

- Node 20+, npm.
- The Klever Web Extension installed (live demo).
- For tests: nothing — the mocked test injects a `MockWallet`.

## How to run

```bash
npm install
npm run dev          # http://localhost:5173 — connect, then switch accounts in the extension
npm test             # mocked vitest run (CI-safe)
npm run test:testnet # mounts against real testnet provider (no extension)
```

## Code map

```
src/
  main.tsx                                   -- KleverProvider bootstrap
  App.tsx                                    -- Listener + log UI
  __tests__/
    setup.ts                                 -- jest-dom matchers
    mock-wallet.ts                           -- shared MockWallet
    react-account-changed-listener.test.tsx  -- mocked default
    react-account-changed-listener.testnet.test.tsx
```

## Gotchas

- **Always remove the listener on unmount**, otherwise StrictMode (which
  double-mounts in dev) leaks one listener per render. The cleanup function
  in `useEffect` handles this.
- **Don't trust the event payload's shape across SDK versions.** This
  example accepts both `'klv1...'` and `{ address: 'klv1...' }` to
  future-proof.
- **The provider already updates `address` from context** — you don't need
  to re-derive it. Use the listener for *side effects*: re-fetching, log
  entries, analytics, etc.
- **`refetch` is idempotent** but expensive. Debounce it if your handler
  fires rapidly (the extension generally emits once per switch).
