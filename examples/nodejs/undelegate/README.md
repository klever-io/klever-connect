# undelegate

Removes the validator association from a frozen bucket. The bucket itself stays
frozen — to recover the funds you must additionally `unfreeze` and then
`withdraw-after-cooldown`.

## Prerequisite chain

1. `freeze-for-staking` → bucketId
2. `delegate-to-validator`
3. **This example**
4. `unfreeze`
5. `withdraw-after-cooldown`

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Bucket owner's hex key. |
| `KLV_BUCKET_ID` | yes | — | Currently-delegated bucket. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/undelegate
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy + missing-bucket cases. |
| `RUN_TESTNET=1 npm run test:testnet` | Live undelegate. |

## Gotchas

- The bucket must currently be delegated; otherwise the chain rejects the tx.
- Undelegate does NOT immediately return funds — only `unfreeze` + cooldown +
  `withdraw-after-cooldown` does.

## Related flows

- `delegate-to-validator`, `unfreeze`, `withdraw-after-cooldown`.
