# `undelegate` (React) — Stage 4 of 6

Stage 4 of the staking flow: remove the validator delegation from a bucket.

## What this shows

- `useStaking().undelegate(bucketId)` (Klever contract type 7).

## Prereqs

- A bucket previously delegated via `delegate-to-validator/`.
- Klever Web Extension installed.

## Run it

```bash
cd examples/reactjs/undelegate
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

- After undelegate the bucket is **still frozen**. To recover assets:
  1. Run the `unfreeze/` example to start the cooldown.
  2. Wait for the network-configured cooldown to elapse.
  3. Run the `withdraw-after-cooldown/` example.
