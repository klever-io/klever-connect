# `react-vote-on-proposal`

> Render an open governance proposal and let the user vote yes/no.

## Pattern

```ts
sendTransaction({
  contractType: TXType.Vote,
  payload: {
    proposalId: 5,
    type: 0,            // 0 = Yes, 1 = No
    amount: parseKLV('1').toString(),
  },
})
```

The example also fetches proposal metadata via `provider.call('proposal/<id>')` so the UI shows the proposal's description and status before voting.

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **Proposal endpoint shape varies between networks.** The `provider.call` path here (`proposal/<id>`) is illustrative — adjust to your network's API.
- **Voting power** is the `amount` in KLV smallest-units. Many voters won't have all their KLV liquid; ensure they have enough non-frozen balance.
- **`VoteType` enum** lives in `@klever/connect-encoding` (`Yes=0`, `No=1`). We use the literal values here for clarity.
