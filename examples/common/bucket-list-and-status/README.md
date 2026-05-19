# `bucket-list-and-status` — Flow #26

Inspect an account's frozen / delegated buckets in one read RPC. Read-only.

## What you learn

- Buckets are stored on the account's `assets[].buckets[]` field — no separate
  RPC needed.
- Each bucket has: `id`, `balance` (smallest units), `validator` (delegation
  target), `stakeAt` (epoch frozen), `unstakedEpoch` (cooldown start, `0` if
  still active).
- The "status" derivation: `unstakedEpoch > 0` -> unstaking; otherwise frozen.

## Run

```bash
npm install
cp .env.example .env
# Set KLEVER_ADDRESS to a testnet account that has frozen KLV.
npm start
```

## Tests

```bash
npm test              # mocked
npm run test:testnet  # only runs if KLEVER_TESTNET_ADDRESS is set
```

## Gotchas

- A bucket `unstakedEpoch` only counts *down* — once cooldown is over, the
  bucket becomes part of the account's withdrawable balance and the bucket
  itself is removed.
- Use the staking flows (`nodejs/freeze-for-staking/`,
  `nodejs/delegate-to-validator/`, ...) to mutate buckets.
- For real-time updates in a UI, see `reactjs/react-staking-flow-end-to-end/`.
