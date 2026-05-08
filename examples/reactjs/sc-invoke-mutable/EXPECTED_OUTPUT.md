# Expected output — `sc-invoke-mutable`

## `npm run dev`

- Heading "SC Invoke (mutable)".
- Inputs: contract address (validated as `klv1qqqqqqqqqq...` form), an `add` numeric input.
- Buttons: `increment()`, `add(value)`.
- After clicking: `Sent! Tx: <hash>` if successful; red error otherwise.

## `npm test`

```
✓ src/__tests__/sc-invoke-mutable.test.tsx (3 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/sc-invoke-mutable.testnet.test.tsx (1 test)
```
