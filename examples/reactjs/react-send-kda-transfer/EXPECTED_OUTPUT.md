# Expected output — `react-send-kda-transfer`

## `npm run dev`

- "Send KDA (with holdings picker)" heading.
- A KDA select listing the connected account's holdings.
- Recipient + Amount inputs.
- Validates against the selected asset's precision and balance.
- After success: green banner `Sent! Tx: ...` plus a "Send another" reset button.

## `npm test`

```
✓ src/__tests__/react-send-kda-transfer.test.tsx (3 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/react-send-kda-transfer.testnet.test.tsx (1 test)
```
