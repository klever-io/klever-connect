# Expected output — `marketplace-list-asset`

## `npm run dev` at `http://localhost:5173`

- Heading: "Marketplace: List Asset".
- If extension absent: red banner.
- If connected: shows `klv1...` with a Disconnect button.
- Form: Asset ID, Marketplace ID, Price (KLV), Duration (days). Submit disabled until validation passes.
- After submit: `Listed! Tx: <hash>` (green).

## `npm test`

```text
✓ src/__tests__/marketplace-list-asset.test.tsx (2 tests)

Test Files  1 passed (1)
Tests       2 passed (2)
```

## `npm run test:testnet`

```text
✓ src/__tests__/marketplace-list-asset.testnet.test.tsx (1 test)
```
