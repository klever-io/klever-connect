# unfreeze

Stops staking on a frozen bucket and starts the cooldown timer. After the cooldown
window elapses (a network parameter), run `withdraw-after-cooldown` to return the
funds to your liquid balance.

## Prerequisite chain

1. `freeze-for-staking` — produces a `bucketId`.
2. (optional) `undelegate` — if the bucket was delegated to a validator.
3. **This example** — starts the cooldown.
4. `withdraw-after-cooldown` — once cooldown elapses.

Each script is independently runnable; you only need the previous step's output
(the `bucketId`) to feed the next.

## What you'll learn

- Unfreeze is `contractType: 5`.
- `kda` is required even for native KLV — pass `'KLV'`.
- The bucket must be undelegated first (chain will reject otherwise).

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner of the bucket. |
| `KLV_BUCKET_ID` | yes | — | Hex bucket id from the freeze tx. |
| `KLV_KDA` | no | `KLV` | Asset of the bucket. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/unfreeze
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy path + missing-bucket edge case. |
| `RUN_TESTNET=1 npm run test:testnet` | Live unfreeze of the configured bucket. |

## Gotchas

- "Bucket is delegated" errors mean you skipped Flow 23 (undelegate) — run it
  first, wait for confirmation, then unfreeze.
- The cooldown duration is a network parameter and may differ between mainnet,
  testnet, and devnet. Check the explorer or `provider.getNetwork()` for current
  values.

## Related flows

- `freeze-for-staking`, `undelegate`, `withdraw-after-cooldown` — the rest of the chain.
