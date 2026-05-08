# governance-vote (Node.js)

Cast a Yes/No vote on an open Klever governance proposal (contractType 14 —
`Vote`).

## Why

Once a proposal is live (see flow 37 — `governance-create-proposal`), eligible
stakeholders push `Vote` transactions to express agreement or rejection. Vote
weight is derived from stake.

## Configuration

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key. |
| `PROPOSAL_ID` | yes | Numeric id of the proposal (read from explorer or receipt). |
| `VOTE` | yes | `yes` or `no`. Maps to integer types 0/1 on the wire. |
| `VOTE_AMOUNT` | no | Stake-weighted vote amount in raw smallest units. Defaults to chain-computed full stake. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default) — sign without broadcasting. |

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test
npm run test:testnet
```

## Gotchas

- The Vote type integers are part of the chain's proto encoding: 0 = YES, 1 =
  NO. Do not invent your own integers — anything else is rejected.
- The voting window only stays open as long as the proposal's `epochsDuration`
  permits. After expiry, votes are rejected at chain level.
- Voting twice on the same proposal from the same address is rejected by most
  Klever networks; use a different address or update your delegated stake first.
