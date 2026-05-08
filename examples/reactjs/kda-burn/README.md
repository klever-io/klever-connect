# `kda-burn` (React)

Burn KDA supply via the Klever Web Extension.

## What this shows

- AssetTrigger contract (type 11) with `triggerType: 1`.
- Why burn requires the burn role on the connected address.
- Use of `parseUnits(amount, precision)` for off-by-decimal safety.

## Prereqs

- The asset exists.
- Connected address has the burn role.
- Klever Web Extension installed.

## Run it

```bash
cd examples/reactjs/kda-burn
npm install
cp .env.example .env.local
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Burn is irreversible. Sanity-check the amount before clicking.
- For NFTs use `amount: 1` and the per-token id (e.g. `MYNFT-A1B2/3`).
