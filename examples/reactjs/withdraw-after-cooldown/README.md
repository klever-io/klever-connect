# `withdraw-after-cooldown` (React) — Stage 6 of 6

Stage 6 of the staking flow: complete the unstake by withdrawing the
unfrozen balance.

## What this shows

- `useStaking().withdraw(withdrawType, options?)`.
- Difference between Unstake (`type 0` — default) and KDA Pool (`type 1`).

## Prereqs

- A bucket previously processed via `unfreeze/`.
- The unfreeze cooldown elapsed (network-configured — testnet is shorter than
  mainnet but still hours).

## Run it

```bash
cd examples/reactjs/withdraw-after-cooldown
npm install
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Withdrawing before cooldown elapses returns an error from the SDK; surface
  it nicely in your dApp's UX.
- `withdrawType 1` (KDA Pool) is for FPR-style payouts, not the bucket
  cooldown completion. Don't mix them up.
