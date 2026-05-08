# freeze-for-staking

Stage 1 of the Klever staking lifecycle: lock KLV (or a KDA) to begin earning
rewards. For KLV, this creates a **bucket** referenced by `bucketId` — that id
flows through every subsequent stage.

## Staking lifecycle (KLV)

```
freeze-for-staking (this example, contractType 4)
        │  bucketId issued
        ▼
delegate-to-validator (Flow 22, contractType 6)   ← starts earning rewards
        │
        ▼
claim-staking-rewards (Flow 24, contractType 9)
        │  (repeat over multiple epochs)
        ▼
undelegate (Flow 23, contractType 7)               ← stops earning rewards
        │
        ▼
unfreeze (Flow 21, contractType 5)                  ← starts cooldown
        │  cooldown timer (network parameter)
        ▼
withdraw-after-cooldown (Flow 25, contractType 8)   ← returns funds to liquid balance
```

Each stage is its own example folder so you can run them independently.

## What you'll learn

- That Freeze is `contractType: 4` regardless of asset.
- That KLV freezes produce a bucket while KDA freezes don't.
- How to surface the resulting `bucketId` (via explorer or receipt parsing).

## Prerequisites

- Funded testnet wallet with at least `KLV_FREEZE_AMOUNT` plus fee.

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `KLV_PRIVATE_KEY` | yes | — | Hex Ed25519 key. |
| `KLV_FREEZE_AMOUNT` | no | `100` | Human-readable amount to freeze. |
| `KLV_FREEZE_KDA` | no | — | KDA id to freeze instead of KLV (no bucket). |
| `KLV_NETWORK` | no | `testnet` | Network. |

## Run

```bash
cd examples/nodejs/freeze-for-staking
npm install
cp .env.example .env
npm start
```

After the tx confirms, copy the `bucketId` from the explorer URL printed in the
output. You'll need it to run the `delegate-to-validator`, `unfreeze`,
`undelegate`, and `withdraw-after-cooldown` examples.

## Tests

| Command | What it does |
|---|---|
| `npm test` | Mocked KLV-freeze and KDA-freeze branches. |
| `RUN_TESTNET=1 npm run test:testnet` | Live freeze of 1 KLV. |

## Gotchas

- `parseKLV` is hard-coded to 6 decimals. For non-6-decimal KDAs, supply the
  amount in smallest units directly (this example does so when `KLV_FREEZE_KDA`
  is set).
- The minimum stake is a network parameter — too small a freeze may be rejected
  by the validator config (only relevant when delegating).
- `wallet.disconnect(true)` clears the private key. Do it after every
  staking-stage script unless you intend to chain calls in the same process.

## Related flows

- `unfreeze`, `delegate-to-validator`, `undelegate`, `claim-staking-rewards`,
  `withdraw-after-cooldown` — the rest of the chain.
