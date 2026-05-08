# Expected output — `react-tx-monitor-multi`

## `npm run dev`

- Heading: "Multi-Transaction Monitor".
- Input + "Watch" button + "Cancel all" button.
- Table with 3 columns: Hash (truncated), Status (colored badge), Cancel button per row.
- Adding a hash: row appears with `pending` badge; updates to `success` or `failed` after backoff polling completes.

## `npm test`

```
✓ src/__tests__/react-tx-monitor-multi.test.tsx (4 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/react-tx-monitor-multi.testnet.test.tsx (1 test)
```
