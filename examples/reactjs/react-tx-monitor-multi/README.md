# `react-tx-monitor-multi`

> Watch many concurrent transactions with `useTransactionMonitor`. One hook, many hashes, status-badge UI.

## API

```ts
const {
  monitor,         // (hash: string) => void
  cancel,          // (hash: string) => void
  cancelAll,       // () => void
  getStatus,       // (hash: string) => TransactionMonitorStatus | undefined
  activeMonitors,  // Array<{ hash, status, ... }>
  isMonitoring,    // boolean
} = useTransactionMonitor({ provider })
```

The hook polls each hash with exponential backoff and updates `activeMonitors` reactively. Render whatever you like — we use a row-per-hash table with colored badges.

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **Pass `provider` explicitly.** The hook does not pull it from `useKlever` automatically — convention is `useTransactionMonitor({ provider: useKlever().provider })`.
- **Don't call `monitor` in a render loop** — it's a side effect. Wire it to button clicks or post-broadcast callbacks.
- **`activeMonitors` is reactive** — your component re-renders when statuses change.
- **Cleanup:** `useTransactionMonitor` cancels pending pollers on unmount, but if you want to be explicit (e.g. when navigating away), call `cancelAll()`.
