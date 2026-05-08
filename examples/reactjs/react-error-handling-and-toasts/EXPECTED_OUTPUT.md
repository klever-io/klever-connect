# Expected output — `react-error-handling-and-toasts`

## `npm run dev`

- Heading: "Error Handling + Toasts".
- Six buttons: ValidationError, NetworkError, WalletError, TransactionError, ContractError, Unknown Error.
- Clicking any pushes a colored toast to the list:
  - ValidationError -> yellow `Invalid input`
  - NetworkError -> red `Network problem` + CTA "Retry in a moment"
  - WalletError -> yellow `Wallet issue`
  - TransactionError -> red `Transaction failed`
  - ContractError -> red `Contract reverted`
  - Plain Error -> red `Unknown error`
- Each toast has a `×` dismiss button.

## `npm test`

```
✓ src/__tests__/react-error-handling-and-toasts.test.tsx (4 tests)
```

## `npm run test:testnet`

```
✓ src/__tests__/react-error-handling-and-toasts.testnet.test.tsx (1 test)
```
