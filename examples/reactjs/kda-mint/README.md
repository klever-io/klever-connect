# `kda-mint` (React)

Mint additional supply of a fungible KDA token from a React UI.

## What this shows

- Building an `AssetTrigger` contract (contract type 11) with `triggerType: 0`
  via `useTransaction.sendTransaction({...})`.
- The `parseUnits(amount, precision)` conversion that prevents off-by-decimal
  bugs.

## Prereqs

- The asset must already exist (`kda-create-fungible/` example for nodejs).
- The connected address must have the **mint role** on the asset.
- Klever Web Extension installed.

## Run it

```bash
cd examples/reactjs/kda-mint
npm install
cp .env.example .env.local      # set VITE_KLV_KDA_ID=YOUR-ASSET
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Mint without the right role fails with a clear "insufficient permissions"
  receipt.
- Maximum supply (if configured at create-time) cannot be exceeded.
- For NFTs use `triggerType: 0` with `amount: 1` per individual token.
