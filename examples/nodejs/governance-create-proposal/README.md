# governance-create-proposal (Node.js)

Submit a Klever governance proposal (contractType 13 — `Proposal`).

## Why

On Klever, chain parameters are mutable through governance. Any sufficiently
staked account can publish a `ProposalRequest`; the network then opens a
voting window where stakeholders cast `Vote` transactions (see flow 38).

## Configuration

See `.env.example`.

| Variable | Required | Notes |
|---|---|---|
| `PRIVATE_KEY` | yes | Hex Ed25519 key of the proposer. |
| `PROPOSAL_PARAMETERS` | yes | JSON object mapping parameter IDs to new values (strings). |
| `PROPOSAL_DESCRIPTION` | no | Free-form text shown to voters. |
| `PROPOSAL_EPOCHS_DURATION` | no | How many epochs voting stays open. |
| `KLV_NETWORK` | no | Defaults to `testnet`. |
| `DRY_RUN` | no | `true` (default) — build + sign without broadcasting. |

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

- Parameter IDs are numeric — but JSON forces them to strings. The example
  re-parses them to integers before passing them to the SDK.
- The chain assigns a `proposalId` only after the transaction is mined. To
  vote (flow 38) you must first read the receipt and grab the id.
- Most networks require the proposer to hold a minimum stake. Check the chain
  parameters for your network before submitting.
- See flow 38 (`governance-vote`) for the next step in the lifecycle.
