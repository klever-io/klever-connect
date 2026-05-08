# `react-network-switch`

Switch a Klever dApp between mainnet / testnet / devnet / local without
losing the connected wallet.

## What this shows

- `useKlever().switchNetwork(name)` to flip provider + wallet network in a
  single call.
- A `useEffect` that refetches `provider.getBlockNumber()` whenever
  `currentNetwork` changes, so the UI confirms the switch took effect.

## Prereqs

- Node 20+, npm.
- Optional: Klever Web Extension. The example renders fine without it.
- For `local` you need a Klever node running on `http://localhost:8080`.

## Run it

```bash
cd examples/reactjs/react-network-switch
npm install
npm run dev
```

Open <http://localhost:5173>, change the dropdown, and watch the latest
block number refresh.

## Tests

```bash
npm test               # unit (vi.mock'd useKlever)
npm run test:testnet   # live testnet block fetch (excluded from CI)
```

## Gotchas

- `switchNetwork()` does NOT prompt the extension. The wallet's `provider`
  pointer is updated in place; subsequent `signTransaction` calls will be
  bound to the new chain ID.
- The provider's WebSocket subscriptions, if any, are torn down and rebuilt
  on switch. Polling-only flows are unaffected.
- Local node URL is the default in the SDK. To target a different host, pass
  `network: createCustomNetwork({...})` to `<KleverProvider>` instead.
