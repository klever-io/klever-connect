# withdraw-after-cooldown

Final stage of the Klever staking lifecycle. Returns funds from a fully-cooled-
down unfrozen bucket back to your liquid balance.

## Prerequisite chain

1. `freeze-for-staking`
2. `delegate-to-validator`
3. (optional) `claim-staking-rewards` repeatedly
4. `undelegate`
5. `unfreeze` — starts the cooldown
6. **Wait for cooldown to elapse** (network parameter; can be hours/days on mainnet)
7. **This example**

## What you'll learn

- That Withdraw is `contractType: 8`.
- The two withdraw streams: `0` (staking unfreeze) and `1` (KDA pool / FPR).
- That the cooldown timer is a chain-side check; submitting too early simply
  produces a failed-status receipt.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Owner of the unfrozen bucket. |
| `KLV_KDA` | no | `KLV` | Asset to withdraw. |
| `KLV_WITHDRAW_TYPE` | no | `0` | `0` = staking, `1` = KDA pool. |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/withdraw-after-cooldown
npm install
cp .env.example .env
npm start
```

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked happy path + KDA-pool branch. |
| `RUN_TESTNET=1 npm run test:testnet` | Live withdraw (will report failure if cooldown is not elapsed). |

## Gotchas

- Cooldown durations differ per network. On devnet they are seconds; on testnet
  minutes; on mainnet hours.
- "Cooldown not elapsed" is reported as a successful broadcast but a failed
  receipt status — always check the receipt, not just the broadcast result.
- Withdraw drains every matured bucket of the specified asset, not a specific
  bucket id.

## Related flows

- `unfreeze`, `claim-staking-rewards`.
