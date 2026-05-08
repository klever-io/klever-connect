# `delegate-to-validator` (React) — Stage 2 of 6

Stage 2 of the staking flow: delegate a frozen KLV bucket to a validator.

## What this shows

- `useStaking().delegate(receiver, bucketId?)`.
- Bucket id is optional; if omitted the SDK auto-creates one.
- Address validation via `isKleverAddress`.

## Prereqs

- A frozen KLV bucket (run `freeze-for-staking/` first).
- A validator address. Find them via the Klever explorer or the
  `provider.call('/v1.0/validator/list')` endpoint.

## Run it

```bash
cd examples/reactjs/delegate-to-validator
npm install
cp .env.example .env.local   # set VITE_KLV_BUCKET_ID + VITE_KLV_VALIDATOR
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- A bucket already delegated must be undelegated first (see `undelegate/`)
  before re-delegating.
- Only KLV buckets are delegatable. Other KDAs accumulate frozen balance
  but never get a bucket id and cannot be delegated.
