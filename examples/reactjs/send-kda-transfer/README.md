# `send-kda-transfer` (React)

Send any KDA token via the Klever Web Extension.

## What this shows

- `useTransaction().sendKDA(to, amount, kdaId)` for non-KLV transfers.
- `parseUnits(value, precision)` for arbitrary-precision tokens (KDAs are
  configured per asset, NOT all 6 decimals like KLV).
- Form validation: address bech32 check, numeric amount, integer precision.

## Prereqs

- Klever Web Extension installed.
- A KDA asset id you hold balance in (e.g. `KFI`, or any custom token).
- The KDA's precision (lookup once via `provider.getAccount(...).assets`).

## Run it

```bash
cd examples/reactjs/send-kda-transfer
npm install
cp .env.example .env.local      # set VITE_KLV_KDA_ID=YOUR-KDA
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Wrong precision = wrong amount. `parseUnits('1', 6)` is 1 000 000 smallest
  units; with the wrong precision you'll send 1000× too much (or too little).
- KFI on Klever is 6-decimal — most custom KDAs are too, but always verify.
- The extension shows the raw smallest-units value in the confirmation popup;
  double-check it matches what you typed × 10^precision.
