# `unfreeze` (React) — Stage 5 of 6

Stage 5 of the staking flow: start the unstake cooldown.

## Stages

See [`freeze-for-staking/README.md`](../freeze-for-staking/README.md) for the
full 6-stage map. After cooldown completes, run the
[`withdraw-after-cooldown/`](../withdraw-after-cooldown/) example to claim
your assets.

## What this shows

- `useStaking().unfreeze(kda, bucketId?)`.
- The bucket id is required for KLV; optional for other KDAs.
- Form-level validation: bucket id must be a hex string for KLV.

## Prereqs

- Klever Web Extension installed.
- A bucket previously created via `freeze-for-staking/` (or any frozen KLV
  bucket on your account). You can list buckets via
  `provider.getAccount(addr).assets`.

## Run it

```bash
cd examples/reactjs/unfreeze
npm install
cp .env.example .env.local      # set VITE_KLV_BUCKET_ID=<your bucket hex>
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Cooldown period is network-configured (hours/epochs). The `withdraw` call
  will fail until it elapses.
- A bucket with an active delegation must be undelegated first
  (see `undelegate/`).
