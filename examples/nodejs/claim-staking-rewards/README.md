# claim-staking-rewards

Claims accrued staking rewards. Two streams covered:

- **APR (claimType 0)** — standard validator-staking rewards in KLV.
- **FPR (claimType 3)** — rewards earned by freezing a specific KDA into its
  asset's reward pool. Requires `id` set to that KDA.

## Prerequisite chain (APR)

1. `freeze-for-staking` → `delegate-to-validator`
2. Wait for at least one epoch boundary (rewards accrue per epoch).
3. **This example**

## What you'll learn

- That Claim is `contractType: 9`.
- The numeric `claimType` selectors and which one needs `id`.
- That claiming does NOT change your stake; the bucket continues earning.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner of the staked bucket. |
| `KLV_CLAIM_TYPE` | no | `0` | `0` = APR, `1` = Allowance, `3` = FPR. |
| `KLV_CLAIM_KDA` | yes when type=3 | — | KDA id for FPR claims. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/claim-staking-rewards
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked APR claim + FPR-without-KDA edge case. |
| `RUN_TESTNET=1 npm run test:testnet` | Live APR claim. |

## Gotchas

- "No rewards to claim" errors are normal if you've claimed within the same
  epoch or have no eligible bucket.
- FPR rewards are denominated in the asset's configured reward token, not
  necessarily the asset itself. Read the asset metadata to be sure.

## Related flows

- `freeze-for-staking`, `delegate-to-validator`, `undelegate`.
