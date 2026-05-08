# Expected output — `marketplace-buy-listing`

## `npm run dev` at `http://localhost:5173`

- Heading "Marketplace: Buy Listing (minimal)".
- Connect button (or connected address + Disconnect).
- Two inputs: Order ID, Price (KLV). Submit disabled until both filled.
- After click: extension prompt; on success the page shows `Bought! Tx: <hash>`.

## `npm test`

```
✓ src/__tests__/marketplace-buy-listing.test.tsx (2 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/marketplace-buy-listing.testnet.test.tsx (1 test)
```
