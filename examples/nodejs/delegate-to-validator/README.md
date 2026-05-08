# delegate-to-validator

Delegates a frozen KLV bucket to a validator. Once delegated, the bucket starts
accruing staking rewards (claimable via Flow 24).

## Prerequisite chain

1. `freeze-for-staking` — produces `KLV_BUCKET_ID`.
2. **This example** — points the bucket at a validator.
3. `claim-staking-rewards` — claim accrued rewards over time.
4. `undelegate` (Flow 23), `unfreeze` (Flow 21), `withdraw-after-cooldown` (Flow 25).

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner of the bucket. |
| `KLV_BUCKET_ID` | yes | — | Bucket id from the freeze tx. |
| `KLV_VALIDATOR` | yes (env or argv[2]) | — | Validator bech32 address. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/delegate-to-validator
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy + invalid-validator cases. |
| `RUN_TESTNET=1 npm run test:testnet` | Live delegation. |

## Gotchas

- Validators set their own commission (% of rewards they keep). Check before delegating.
- A bucket can only be delegated to one validator at a time. Re-delegating means
  undelegate -> delegate, not a single call.
- Some validators have `canDelegate=false` and will reject delegation tx.

## Related flows

- `freeze-for-staking`, `undelegate`, `claim-staking-rewards`.
