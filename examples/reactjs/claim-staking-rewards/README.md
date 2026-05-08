# `claim-staking-rewards` (React) — Stage 3 of 6

Stage 3 of the staking flow: claim accumulated rewards.

## What this shows

- `useStaking().claim(claimType, id?)` — picks between APR / Market /
  Allowance / FPR claim flavours.
- Why the dropdown shows numbered codes (0–3): they map to the on-chain
  enum `ClaimType` consumed by the SDK.

## Prereqs

- Klever Web Extension installed.
- Some accumulated rewards (delegated buckets earning APR, or FPR deposits).

## Run it

```bash
cd examples/reactjs/claim-staking-rewards
npm install
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Claim type 0 (APR) pays from the asset owner's APR bucket — its rate can
  change at any time.
- Claim type 3 (FPR) requires the KDA to have a staking pool with deposits;
  small/young KDAs may have nothing to claim.
- Claiming with no pending rewards does not error — it just costs the gas
  fee for an empty transaction. Check the receipt before showing "claimed".
