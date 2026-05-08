# Expected output — `react-provider-setup`

## What the user sees

After `npm install && npm run dev`, open <http://localhost:5173>. The page shows:

```
Klever Connect — Provider Setup

This is the react-provider-setup example. It demonstrates the
absolute minimum you need to start building a Klever dApp with
React: wrap your tree in <KleverProvider> and read state via
useKlever().

┌── Live state ─────────────────────────────────────────┐
│ Network    testnet                                    │
│ Extension  Installed                                  │  ← if you have the
│ Wallet     Not connected                              │     Klever Web Extension
└───────────────────────────────────────────────────────┘
```

If the extension is NOT installed, the "Extension" row reads:

```
Extension   Not installed — see https://klever.io/extension
```

If the extension is still being detected (during the first ~500 ms after
mount), it briefly reads:

```
Extension   Detecting…
```

## Network override

Set `VITE_KLV_NETWORK=mainnet` in `.env.local` (or your shell) and restart
`npm run dev`. The "Network" row will now read `mainnet`.

## Wallet status

This example never calls `connect()`, so the Wallet row always reads
"Not connected". See the next example, `react-wallet-connect-disconnect`, for
a Connect button.
