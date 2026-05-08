# Expected output — `react-send-klv-transfer`

## `npm run dev`

- "Send KLV (polished)" heading.
- Connect / Disconnect button.
- Recipient input (red border + "Invalid klv1 address" if malformed).
- Amount (KLV) input. Live "Will send X KLV to klv1...".
- "Send KLV" button (disabled until valid).
- After success: green toast "Sent! Tx hash: ..." and a "Send another" button.

## `npm test`

```
✓ src/__tests__/react-send-klv-transfer.test.tsx (3 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/react-send-klv-transfer.testnet.test.tsx (1 test)
```
