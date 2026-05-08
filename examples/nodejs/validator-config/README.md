# validator-config (Node.js)

Update an already-registered Klever validator's on-chain configuration
(contractType 3 — `ValidatorConfig`). The transaction is a partial update:
omitted fields are left unchanged on-chain.

## Why

Operators routinely tweak validator parameters — commission, max delegation
cap, reward address, display name. This example shows the exact field shape
the SDK expects and demonstrates the "send only the fields you want to change"
pattern.

## Prerequisites

- Operator wallet (hex private key) that signed the original CreateValidator.
- The validator's BLS public key.
- Node.js >= 18.

## Configuration

See `.env.example`. All update fields are optional; only `BLS_PUBLIC_KEY` and
`PRIVATE_KEY` are required.

## Run

```bash
npm install
npm start
```

## Tests

```bash
npm test               # mocked
npm run test:testnet   # live (requires PRIVATE_KEY + BLS_PUBLIC_KEY env vars)
```

## Gotchas

- The chain ignores fields that aren't in the request. Use `unset`/blank to
  preserve existing values, NOT `null`.
- `commission` is integer basis-points × 100. Same range as CreateValidator.
- Updating `rewardAddress` does not retroactively redirect already-pending
  rewards; it only affects payouts from this transaction onward.
- See `validator-create` (flow 35) for the registration step.
