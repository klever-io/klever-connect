# Expected output — `react-vote-on-proposal`

## `npm run dev`

- Heading: "Vote on Proposal".
- Connect button.
- Proposal ID input. When filled, fetches metadata and renders a card with description + status.
- Vote weight (KLV) input.
- Two buttons: "Vote Yes", "Vote No".
- After click: extension prompt; `Voted! Tx: <hash>`.

## `npm test`

```
✓ src/__tests__/react-vote-on-proposal.test.tsx (3 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/react-vote-on-proposal.testnet.test.tsx (1 test)
```
