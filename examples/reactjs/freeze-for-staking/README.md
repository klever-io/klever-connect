# `freeze-for-staking` (React) — Stage 1 of 6

Stage 1 of the React staking flow: freeze KLV (or any KDA).

## Stages

| Stage | Folder                              | What it does                                    |
| ----- | ----------------------------------- | ----------------------------------------------- |
| 1     | `freeze-for-staking/` (this folder) | Freeze KLV — creates a bucket                   |
| 2     | `delegate-to-validator/`            | Delegate the bucket to a validator              |
| 3     | `claim-staking-rewards/`            | Claim rewards (APR / FPR)                       |
| 4     | `undelegate/`                       | Undelegate from validator                       |
| 5     | `unfreeze/`                         | Unfreeze the bucket (start cooldown)            |
| 6     | `withdraw-after-cooldown/`          | Withdraw the unfrozen balance                   |

Each stage is its own runnable example so you can drive them independently —
no need to wait through real cooldowns inside one app.

## What this shows

- `useStaking().freeze(amount, kda?)` builds and signs a `Freeze` contract.
- The bucket id is read from the transaction receipt (only for KLV freezes).
- Difference between freezing KLV (creates bucket) and freezing any other KDA
  (accumulates frozen balance, no bucket id).

## Prereqs

- Klever Web Extension installed.
- Some KLV in the connected address. Use the testnet faucet if needed.

## Run it

```bash
cd examples/reactjs/freeze-for-staking
npm install
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Maximum 100 KLV buckets per user. New freezes after the cap will fail.
- Adding to an existing bucket resets the minimum unfreeze time — do this
  on purpose, not by accident.
- KDA freezes don't create buckets — `unfreeze`/`withdraw` work without a
  bucket id for those.
