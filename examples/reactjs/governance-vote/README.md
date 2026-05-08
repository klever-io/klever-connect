# `governance-vote` (React)

Cast a yes/no vote on a Klever governance proposal.

## What this shows

- `useTransaction.sendTransaction({ contractType: TXType.Vote, ... })`.
- Use of `parseUnits('100', 6)` to convert KFI voting power into smallest units.
- Why `proposalId` is a number, not a string — the on-chain field is `uint`.

## Prereqs

- Klever Web Extension installed.
- A KFI balance to cast voting power.
- An active proposal id. Find one via the Klever explorer or via
  `provider.call('/v1.0/proposal/list')`.

## Run it

```bash
cd examples/reactjs/governance-vote
npm install
cp .env.example .env.local      # set VITE_KLV_PROPOSAL_ID=<id>
npm run dev
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- Voting on a closed proposal fails.
- A user can vote multiple times on the same proposal — votes accumulate.
- Voting power is denominated in KFI smallest units (6 decimals).
