# Expected output — `react-sc-invoke-with-extension`

## `npm run dev`

- Heading "SC Invoke with Extension (ABI-driven)".
- Status line: "ABI loaded: counter (4 endpoints)".
- Connect button.
- Contract address input.
- Endpoint dropdown listing only mutable endpoints.
- Dynamic per-arg inputs based on the chosen endpoint.
- "Invoke" button -> Sent! Tx: `<hash>`.

## `npm test`

```
✓ src/__tests__/react-sc-invoke-with-extension.test.tsx (3 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/react-sc-invoke-with-extension.testnet.test.tsx (1 test)
```
